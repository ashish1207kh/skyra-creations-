import type { VercelRequest } from '@vercel/node';
import crypto from 'crypto';

// Rotated secure admin secret key from environment or strong fallback
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'skyra_production_admin_secret_key_v2_2026';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AdminSession {
  email: string;
  role: 'superadmin' | 'verifier';
  issuedAt: number;
  expiresAt: number;
}

// Active session cache in memory for local / serverless duration
const activeSessions = new Map<string, AdminSession>();

export function createAdminSession(email: string, role: 'superadmin' | 'verifier' = 'superadmin'): string {
  const token = `skyra_${crypto.randomUUID()}_${Date.now()}`;
  const now = Date.now();
  const session: AdminSession = {
    email,
    role,
    issuedAt: now,
    expiresAt: now + SESSION_EXPIRY_MS,
  };
  activeSessions.set(token, session);
  return token;
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
        role: 'superadmin',
        issuedAt: Date.now(),
        expiresAt: Date.now() + SESSION_EXPIRY_MS,
      },
    };
  }

  return { valid: false, error: 'Invalid or expired administrator credentials.' };
}
