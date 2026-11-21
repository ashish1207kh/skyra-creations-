import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookupPublicParticipantRecord } from './_lib/database.js';
import { checkRateLimit } from './_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  // Rate-limit public lookup requests to prevent enumeration (20 lookups per minute per IP)
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp + ':lookup', 20, 60);
  if (!allowed) {
    return res.status(429).json({ detail: 'Too many lookup requests. Please wait a moment.' });
  }

  const query = (req.query.query as string || req.query.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ detail: 'Please enter a valid Registration ID or registered email/mobile.' });
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
