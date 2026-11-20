import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyPaymentRecord } from '../_lib/supabaseAdmin.js';
import { verifyAdminAuth } from '../_lib/adminAuth.js';

const verifySchema = z.object({
  payment_id: z.string().min(1),
  action: z.enum(['VERIFY', 'REJECT']),
  rejection_reason: z.string().optional(),
  admin_name: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const auth = verifyAdminAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ detail: auth.error || 'Unauthorized' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  try {
    const data = verifySchema.parse(req.body);

    if (data.action === 'REJECT' && (!data.rejection_reason || data.rejection_reason.trim().length === 0)) {
      return res.status(400).json({ detail: 'A mandatory rejection reason is required to reject a payment.' });
    }

    const adminDisplayName = data.admin_name || auth.session?.email || 'Operations Director';

    const result = await verifyPaymentRecord({
      payment_id: data.payment_id,
      action: data.action,
      reason: data.rejection_reason,
      adminName: adminDisplayName,
      ipAddress: clientIp,
    });

    return res.status(200).json({
      success: true,
      message: `Payment ${data.payment_id} has been marked as ${data.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED'}.`,
      result,
    });
  } catch (err: any) {
    const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    return res.status(400).json({ detail: msg });
  }
}
