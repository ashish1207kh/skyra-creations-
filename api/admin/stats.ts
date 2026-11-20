import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDashboardStats } from '../_lib/supabaseAdmin.js';
import { verifyAdminAuth } from '../_lib/adminAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const auth = verifyAdminAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ detail: auth.error || 'Unauthorized' });
  }

  try {
    const stats = await getDashboardStats();
    return res.status(200).json(stats);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
