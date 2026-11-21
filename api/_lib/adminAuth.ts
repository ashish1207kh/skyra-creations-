import type { VercelRequest } from '@vercel/node';
import crypto from 'crypto';

export type AdminRole = 'OWNER' | 'ADMINISTRATOR' | 'PAYMENT_VERIFICATION_STAFF' | 'VIEWER';

// Rotated secure admin secret key from environment or strong fallback
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'skyra_production_admin_secret_key_v2_2026';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  email: string;
  role: AdminRole;
  issuedAt: number;
  expiresAt: number;
}

// Active session cache in memory for serverless duration
const activeSessions = new Map<string, AdminSession>();

export function normalizeRole(role: string): AdminRole {
  const r = role.toUpperCase();
  if (r === 'OWNER') return 'OWNER';
  if (r === 'ADMINISTRATOR' || r === 'SUPERADMIN' || r === 'ADMIN') return 'ADMINISTRATOR';
  if (r === 'PAYMENT_VERIFICATION_STAFF' || r === 'VERIFIER' || r === 'STAFF') return 'PAYMENT_VERIFICATION_STAFF';
  return 'VIEWER';
}

export function createAdminSession(email: string, rawRole: string = 'OWNER'): string {
  const token = `skyra_${crypto.randomUUID()}_${Date.now()}`;
  const now = Date.now();
  const session: AdminSession = {
    email,
    role: normalizeRole(rawRole),
    issuedAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };
  activeSessions.set(token, session);
  return token;
}

export function hasPermission(role: AdminRole, action: string): boolean {
  switch (action) {
    case 'delete-event':
    case 'purge-data':
    case 'manage-admins':
      return role === 'OWNER';

    case 'export':
    case 'upload-qr':
    case 'edit-event':
      return role === 'OWNER' || role === 'ADMINISTRATOR';

    case 'verify-payment':
    case 'reject-payment':
      return role === 'OWNER' || role === 'ADMINISTRATOR' || role === 'PAYMENT_VERIFICATION_STAFF';

    case 'stats':
    case 'participants':
    case 'auth':
    case 'login':
      return true;

    default:
      return role === 'OWNER' || role === 'ADMINISTRATOR';
  }
}

export function verifyAdminAuth(req: VercelRequest): { valid: boolean; session?: AdminSession; error?: string } {
  const authHeader = req.headers.authorization || '';
  const adminKeyHeader = (req.headers['x-admin-key'] as string) || '';
  const queryToken = (req.query?.token as string) || '';

  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (adminKeyHeader) {
    token = adminKeyHeader.trim();
  } else if (queryToken) {
    token = queryToken.trim();
  }

  if (!token) {
    return { valid: false, error: 'Authorization token or admin key required.' };
  }

  // 1. Check if token matches active session
  const session = activeSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return { valid: false, error: 'Session expired. Please log in again.' };
    }
    return { valid: true, session };
  }

  // 2. Check if token matches server-side rotated admin secret key
  if (token === ADMIN_SECRET) {
    return {
      valid: true,
      session: {
        email: 'admin@skyracreations.com',
        role: 'OWNER',
        issuedAt: Date.now(),
        expiresAt: Date.now() + SESSION_EXPIRY_MS,
      },
    };
  }

  return { valid: false, error: 'Invalid or expired administrator credentials.' };
}
