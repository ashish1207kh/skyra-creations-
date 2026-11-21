import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyPassToken } from './_lib/supabaseAdmin.js';
import { checkRateLimit } from './_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp + ':pass_verify', 60, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Rate limit exceeded for pass verification.' });
  }

  const token = (req.query.token as string || '').trim();
  if (!token) {
    return res.status(400).json({ valid: false, detail: 'Verification token is required.' });
  }

  try {
    const result = await verifyPassToken(token);
    return res.status(result.valid ? 200 : 404).json(result);
  } catch (err: any) {
    return res.status(500).json({ valid: false, detail: err.message });
  }
}
