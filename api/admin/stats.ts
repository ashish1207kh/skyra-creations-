import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDashboardStats } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const stats = await getDashboardStats();
    return res.status(200).json(stats);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
