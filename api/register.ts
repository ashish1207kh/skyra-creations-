import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { registerParticipant } from './_lib/database.js';
import { checkRateLimit } from './_lib/rateLimit.js';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  email: z.string().email('Please enter a valid email address'),
  dob: z.string().min(4, 'Please select your date of birth'),
  gender: z.string().min(1, 'Please select your gender'),
  mobile: z.string().min(8, 'Please enter a valid mobile number').max(25),
  whatsapp: z.string().min(8, 'Please enter a valid WhatsApp number').max(25),
  city: z.string().min(2, 'City is required').max(100),
  category: z.string().default('Runway Model'),
  height: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  model_photo_r2_key: z.string().min(5, 'Please upload your recent model photograph'),
  amount: z.number().refine((val) => [500, 1000, 1500].includes(val), {
    message: 'Token advance must be ₹500, ₹1,000, or ₹1,500',
  }),
  transaction_id: z.string().min(4, 'Please enter a valid 12-digit UPI reference / UTR number').max(100),
  r2_object_key: z.string().min(5, 'Payment screenshot proof is required'),
  terms_confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Official Terms & Event Policies and Participant Declaration.',
  }),
  terms_version: z.string().optional().default('2026.2'),
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

    const { participant, payment } = await registerParticipant({
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
      model_photo_r2_key: data.model_photo_r2_key,
      amount: data.amount,
      transaction_id: data.transaction_id,
      r2_object_key: data.r2_object_key,
      terms_confirmed: data.terms_confirmed,
      terms_version: data.terms_version,
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
