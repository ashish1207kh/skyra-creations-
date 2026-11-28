import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { generatePresignedUploadUrl, generatePresignedViewUrl, isR2Configured } from '../_lib/r2Client.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { saveFileToMongo, getFileFromMongo } from '../_lib/mongoStorage.js';

export const config = {
  api: {
    bodyParser: false, // Allows streaming raw binary image uploads directly into MongoDB
  },
};

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  fileSizeBytes: z.number().int().positive().max(10 * 1024 * 1024), // Max 10MB
  folder: z.enum(['proofs', 'portfolios', 'photos']).optional(),
});

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (typeof req.body === 'object' && req.body !== null) {
    return Buffer.from(JSON.stringify(req.body));
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const rawAction = (req.query.action as string) || (req.url?.split('?')[0].split('/').pop() || '');
  const action = rawAction.toLowerCase();

  // Route 1: POST /api/storage/presigned-upload
  if (action === 'presigned-upload') {
    if (req.method !== 'POST') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const clientIp = (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const { allowed } = checkRateLimit(clientIp, 30, 60);
    if (!allowed) {
      return res.status(429).json({ detail: 'Rate limit exceeded. Please wait a minute before requesting another upload.' });
    }

    try {
      const raw = await readRawBody(req);
      const body = JSON.parse(raw.toString('utf-8'));
      const validated = uploadSchema.parse(body);

      const presigned = await generatePresignedUploadUrl({
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        fileSizeBytes: validated.fileSizeBytes,
        folder: validated.folder,
      });

      return res.status(200).json({
        uploadUrl: presigned.uploadUrl,
        objectKey: presigned.objectKey,
        expiresInSeconds: presigned.expiresInSeconds,
        upload_url: presigned.uploadUrl,
        object_key: presigned.objectKey,
        expires_in_seconds: presigned.expiresInSeconds,
      });
    } catch (err: any) {
      const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
      return res.status(400).json({ detail: msg });
    }
  }

  // Route 2: PUT / POST /api/storage/upload (Direct MongoDB File Upload)
  if (action === 'upload') {
    if (req.method !== 'PUT' && req.method !== 'POST') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const objectKey = (req.query.key as string) || (req.headers['x-object-key'] as string);
    if (!objectKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter for upload.' });
    }

    const contentType = (req.headers['content-type'] as string) || 'image/jpeg';
    const cleanMime = contentType.split(';')[0].trim().toLowerCase();

    try {
      const buffer = await readRawBody(req);
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ detail: 'No file data received in upload payload.' });
      }

      await saveFileToMongo(objectKey, buffer, cleanMime);

      return res.status(200).json({
        success: true,
        objectKey,
        sizeBytes: buffer.length,
        mimeType: cleanMime,
      });
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Failed to save file to database.' });
    }
  }

  // Route 3: GET /api/storage/file OR /api/storage/view (Serve Stored File from MongoDB)
  if (action === 'file' || action === 'view') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const objectKey = req.query.key as string;
    if (!objectKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter.' });
    }

    try {
      const file = await getFileFromMongo(objectKey);
      if (file && file.buffer) {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Length', file.size.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return res.send(file.buffer);
      }

      // Fallback for historical test keys without bytes: High-fidelity Couture Avatar SVG
      const isProof = objectKey.includes('proofs');
      const label = isProof ? 'PAYMENT PROOF' : 'MODEL PHOTOGRAPH';
      const sub = objectKey.split('/').pop() || 'SKYRA CREATIONS';
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
          <rect width="600" height="600" fill="#0c0d12"/>
          <circle cx="300" cy="240" r="110" fill="#181a24" stroke="#c6ff00" stroke-width="2" stroke-opacity="0.4"/>
          <path d="M 190 470 C 190 370, 410 370, 410 470 Z" fill="#181a24" stroke="#c6ff00" stroke-width="2" stroke-opacity="0.4"/>
          <text x="300" y="520" text-anchor="middle" fill="#c6ff00" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="3">${label}</text>
          <text x="300" y="550" text-anchor="middle" fill="#888" font-family="monospace" font-size="13">${sub}</text>
        </svg>
      `.trim();

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(Buffer.from(fallbackSvg, 'utf-8'));
    } catch (err: any) {
      return res.status(500).json({ detail: err.message || 'Error retrieving file.' });
    }
  }

  // Route 4: GET /api/storage/presigned-view
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
