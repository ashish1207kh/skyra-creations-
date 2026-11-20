import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePresignedViewUrl } from '../_lib/r2Client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
