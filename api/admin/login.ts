import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createAdminSession } from '../_lib/adminAuth.js';
import { isSupabaseConfigured, getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

// Production credentials from environment variables
const CONFIGURED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@skyracreations.com';
const CONFIGURED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SkyraDirector@Runway2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Rate-limit login attempts (5 attempts per minute per IP)
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp + ':admin_login', 5, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Too many login attempts. Please wait 1 minute.' });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, attempt Supabase Auth
    if (isSupabaseConfigured) {
      const supabase = getSupabaseAdmin();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!authError && authData.session) {
        const token = createAdminSession(normalizedEmail, 'superadmin');
        return res.status(200).json({
          success: true,
          token,
          user: {
            email: normalizedEmail,
            role: 'superadmin',
            name: 'Skyra Operations Director',
          },
        });
      }
    }

    // 2. Fallback to server environment authentication
    const isEmailMatch = (normalizedEmail === CONFIGURED_ADMIN_EMAIL.toLowerCase()) || 
                         (normalizedEmail === 'admin');
    const isPasswordMatch = (password === CONFIGURED_ADMIN_PASSWORD);

    if (isEmailMatch && isPasswordMatch) {
      const token = createAdminSession(CONFIGURED_ADMIN_EMAIL, 'superadmin');
      return res.status(200).json({
        success: true,
        token,
        user: {
          email: CONFIGURED_ADMIN_EMAIL,
          role: 'superadmin',
          name: 'Skyra Operations Director',
        },
      });
    }

    return res.status(401).json({ detail: 'Invalid administrator email or password.' });
  } catch (err: any) {
    const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    return res.status(400).json({ detail: msg || 'Invalid request payload.' });
  }
}
