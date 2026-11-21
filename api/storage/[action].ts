import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { generatePresignedUploadUrl, generatePresignedViewUrl } from '../_lib/r2Client.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().int().positive().max(10 * 1024 * 1024), // Max 10MB
  folder: z.enum(['proofs', 'portfolios', 'photos']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawAction = (req.query.action as string) || (req.url?.split('?')[0].split('/').pop() || '');
  const action = rawAction.toLowerCase();

  // Route 1: POST /api/storage/presigned-upload
  if (action === 'presigned-upload') {
    if (req.method !== 'POST') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const clientIp = (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
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

  // Route 2: GET /api/storage/presigned-view
  if (action === 'presigned-view') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const objectKey = req.query.key as string;
    if (!objectKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter.' });
    }

    try {
      const viewUrl = await generatePresignedViewUrl(objectKey);
      return res.status(200).json({ view_url: viewUrl });
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  return res.status(404).json({ detail: `Storage action '${action}' not found.` });
}
