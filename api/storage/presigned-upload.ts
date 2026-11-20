import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { generatePresignedUploadUrl } from '../_lib/r2Client.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().int().positive().max(10 * 1024 * 1024), // Max 10MB
  folder: z.enum(['proofs', 'portfolios']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp, 20, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Rate limit exceeded. Please wait a minute before requesting another upload.' });
  }

  try {
    const validated = uploadSchema.parse(req.body);
    const presigned = await generatePresignedUploadUrl({
      fileName: validated.fileName,
      mimeType: validated.mimeType,
      fileSizeBytes: validated.fileSizeBytes,
      folder: validated.folder,
    });

    return res.status(200).json(presigned);
  } catch (err: any) {
    const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    return res.status(400).json({ detail: msg });
  }
}
