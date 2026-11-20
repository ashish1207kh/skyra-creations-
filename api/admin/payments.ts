import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllPayments } from '../_lib/supabaseAdmin.js';
import { generatePresignedViewUrl } from '../_lib/r2Client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const rawPayments = await getAllPayments();
    
    // Enrich each payment with a short-lived presigned view URL for private R2 object
    const paymentsWithUrls = await Promise.all(
      rawPayments.map(async (pay: any) => {
        try {
          const view_url = await generatePresignedViewUrl(pay.r2_object_key);
          return { ...pay, view_url };
        } catch {
          return { ...pay, view_url: '/qr_code.png' };
        }
      })
    );

    return res.status(200).json(paymentsWithUrls);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
