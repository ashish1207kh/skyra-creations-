import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  return res.status(200).json({
    event_name: 'SKYRA CREATIONS - RUNWAY SHOW',
    upi_id: 'mr.death4646@oksbi',
    upi_name: 'Sanjay Mass',
    default_total_fee: 5000.0,
    allowed_balance_amounts: [500, 1000, 1500, 2000, 2500, 3000, 3500],
    qr_code_url: '/qr_code.png',
  });
}
