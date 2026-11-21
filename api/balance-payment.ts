import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { submitBalancePayment } from './_lib/database.js';
import { checkRateLimit, validateSecurityContext } from './_lib/rateLimit.js';

const balanceSchema = z.object({
  reg_id: z.string().min(4, 'Registration ID is required'),
  full_name: z.string().min(2, 'Full name is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  transaction_id: z.string().min(4, 'Please enter a valid UPI reference / UTR number'),
  r2_object_key: z.string().min(5, 'Payment screenshot proof is required'),
  terms_confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm event terms and conditions.',
  }),
  hp_security_check: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Anti-DoS & Security Context Validation
  const sec = validateSecurityContext(req, { maxRequests: 15, windowSeconds: 60, endpoint: 'balance' });
  if (!sec.allowed) {
    return res.status(sec.status || 429).json({ detail: sec.error || 'Request blocked by security filter' });
  }

  try {
    const data = balanceSchema.parse(req.body);

    const { participant, payment } = await submitBalancePayment({
      reg_id: data.reg_id.trim().toUpperCase(),
      amount: data.amount,
      transaction_id: data.transaction_id.trim(),
      r2_object_key: data.r2_object_key,
    });

    return res.status(200).json({
      success: true,
      message: `Balance payment of ₹${data.amount} submitted successfully! Our team will verify your payment.`,
      reg_id: participant.reg_id,
      payment_id: payment.payment_id,
      amount: payment.amount,
      status: payment.status,
      participant_name: participant.full_name,
      current_balance_due: participant.balance_due,
    });
  } catch (err: any) {
    const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    return res.status(400).json({ detail: msg });
  }
}
