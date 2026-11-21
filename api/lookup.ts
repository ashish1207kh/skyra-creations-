import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookupPublicParticipantRecord } from './_lib/database.js';
import { checkRateLimit } from './_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Rate-limit public lookup requests to prevent enumeration (20 lookups per minute per IP)
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp + ':lookup', 20, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Too many lookup requests. Please wait a moment.' });
  }

  const rawQuery = req.query.query || req.query.q;
  if (!rawQuery || typeof rawQuery !== 'string') {
    return res.status(400).json({ detail: 'Please enter a valid Registration ID or registered email/mobile.' });
  }

  const query = rawQuery.trim();
  if (!query || query.length > 80 || /[$<>{}\0]/.test(query)) {
    return res.status(400).json({ detail: 'Invalid characters or excessive length in search parameter.' });
  }

  try {
    const participant = await lookupPublicParticipantRecord(query);
    if (!participant) {
      return res.status(404).json({ detail: `No registration record found matching "${query}".` });
    }

    // Set short cache control to avoid heavy load while preserving dynamic updates
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
    return res.status(200).json(participant);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
