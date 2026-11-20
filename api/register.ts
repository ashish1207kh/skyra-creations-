import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createParticipantAndPayment } from './_lib/supabaseAdmin.js';
import { checkRateLimit } from './_lib/rateLimit.js';

const registerSchema = z.object({
  full_name: z.string().min(2).max(150),
  email: z.string().email(),
  dob: z.string().min(4),
  gender: z.string().min(1),
  mobile: z.string().min(8).max(25),
  whatsapp: z.string().min(8).max(25),
  city: z.string().min(2).max(100),
  category: z.string().default('Runway Model'),
  height: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  amount: z.number().positive().max(5000),
  transaction_id: z.string().min(4).max(100),
  r2_object_key: z.string().min(5),
  terms_confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm terms and conditions to register.',
  }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp, 10, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Too many registration requests. Please wait a moment.' });
  }

  try {
    const data = registerSchema.parse(req.body);

    const { participant, payment } = await createParticipantAndPayment({
      participantData: {
        full_name: data.full_name,
        email: data.email,
        dob: data.dob,
        gender: data.gender,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        city: data.city,
        category: data.category,
        height: data.height,
        instagram: data.instagram,
        experience: data.experience,
        total_fee: 5000,
      },
      paymentData: {
        amount: data.amount,
        transaction_id: data.transaction_id,
        r2_object_key: data.r2_object_key,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Registration submitted successfully! Our team will contact you on WhatsApp after verification.',
      reg_id: participant.reg_id,
      participant,
      payment,
    });
  } catch (err: any) {
    const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    return res.status(400).json({ detail: msg });
  }
}
