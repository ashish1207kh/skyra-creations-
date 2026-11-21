import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEventConfig } from './_lib/database.js';
import { checkRateLimit } from './_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp + ':payment_info', 60, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Too many requests. Please wait.' });
  }

  try {
    const eventConfig = await getEventConfig('EVT-CHX-2026');

    return res.status(200).json({
      event_id: eventConfig.event_id,
      event_name: eventConfig.title || 'SKYRA CREATIONS - RUNWAY SHOW',
      location: eventConfig.location,
      upi_id: process.env.UPI_ID || 'sri.469512-1@oksbi',
      upi_name: process.env.UPI_NAME || 'B Sriram',
      bank_name: 'Indian Bank',
      bank_account_ref: '5056',
      associated_mobile: '9342049287',
      currency: 'INR',
      aid: 'uGICAgLCoysb4Rw',
      default_total_fee: eventConfig.total_fee,
      allowed_token_advances: eventConfig.allowed_token_advances,
      allowed_balance_amounts: eventConfig.allowed_balance_amounts,
      terms_version: eventConfig.terms_version,
      photo_required: eventConfig.photo_required,
      qr_code_url: '/qr_code.png',
    });
  } catch (err: any) {
    return res.status(200).json({
      event_id: 'EVT-CHX-2026',
      event_name: 'SKYRA CREATIONS - RUNWAY SHOW',
      location: 'Chennai & Selected Nearby Locations',
      upi_id: process.env.UPI_ID || 'sri.469512-1@oksbi',
      upi_name: process.env.UPI_NAME || 'B Sriram',
      bank_name: 'Indian Bank',
      bank_account_ref: '5056',
      associated_mobile: '9342049287',
      currency: 'INR',
      aid: 'uGICAgLCoysb4Rw',
      default_total_fee: 3000.0,
      allowed_token_advances: [500, 1000, 1500],
      allowed_balance_amounts: [500, 1000, 1500, 2000, 2500],
      terms_version: '2026.2',
      photo_required: true,
      qr_code_url: '/qr_code.png',
    });
  }
}
