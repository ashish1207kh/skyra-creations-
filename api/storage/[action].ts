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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Object-Key, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    const rawKey = (req.query.key as string) || (req.headers['x-object-key'] as string);
    if (!rawKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter for upload.' });
    }
    const objectKey = decodeURIComponent(rawKey).replace(/^\/+/, '');

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

    const rawKey = req.query.key as string;
    if (!rawKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter.' });
    }

    const objectKey = decodeURIComponent(rawKey).replace(/^\/+/, '');

    try {
      let file = await getFileFromMongo(objectKey);
      if (!file && rawKey !== objectKey) {
        file = await getFileFromMongo(rawKey);
      }

      if (file && file.buffer) {
        res.setHeader('Content-Type', file.mimeType || 'image/jpeg');
        res.setHeader('Content-Length', file.size.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return res.send(file.buffer);
      }

      // Fallback for historical test keys without bytes: High-fidelity Couture Avatar SVG
      const isProof = objectKey.includes('proofs');
      const label = isProof ? 'PAYMENT PROOF' : 'MODEL DOSSIER';
      const sub = objectKey.split('/').pop() || 'SKYRA CREATIONS';
      const fallbackSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
          <defs>
            <linearGradient id="fbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0c0d14"/>
              <stop offset="100%" stop-color="#141824"/>
            </linearGradient>
          </defs>
          <rect width="600" height="600" fill="url(#fbGrad)"/>
          <rect x="20" y="20" width="560" height="560" rx="16" fill="none" stroke="${isProof ? '#10B981' : '#C6FF00'}" stroke-width="3" stroke-opacity="0.6"/>
          
          <circle cx="300" cy="220" r="90" fill="#1b2030" stroke="${isProof ? '#10B981' : '#C6FF00'}" stroke-width="2" stroke-opacity="0.8"/>
          <path d="M 230 220 Q 300 150 370 220" stroke="${isProof ? '#10B981' : '#C6FF00'}" stroke-width="4" fill="none"/>
          <circle cx="300" cy="220" r="14" fill="${isProof ? '#10B981' : '#C6FF00'}"/>

          <rect x="80" y="360" width="440" height="70" rx="8" fill="#080a10" stroke="#ffffff" stroke-width="1" stroke-opacity="0.15"/>
          <text x="300" y="405" text-anchor="middle" fill="${isProof ? '#10B981' : '#C6FF00'}" font-family="'Courier New', monospace" font-size="24" font-weight="900" letter-spacing="4">${label}</text>
          
          <text x="300" y="475" text-anchor="middle" fill="#ffffff" font-family="'Cinzel', serif, sans-serif" font-size="20" font-weight="bold" letter-spacing="4">SKYRA CREATIONS</text>
          <text x="300" y="515" text-anchor="middle" fill="#718096" font-family="'Courier New', monospace" font-size="12" letter-spacing="2">${sub}</text>
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

    const rawKey = req.query.key as string;
    if (!rawKey) {
      return res.status(400).json({ detail: 'Missing "key" query parameter.' });
    }
    const objectKey = decodeURIComponent(rawKey).replace(/^\/+/, '');

    try {
      const viewUrl = await generatePresignedViewUrl(objectKey);
      return res.status(200).json({ view_url: viewUrl });
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  return res.status(404).json({ detail: `Storage action '${action}' not found.` });
}
