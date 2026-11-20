import type { VercelRequest, VercelResponse } from '@vercel/node';
import { lookupParticipant } from './_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const query = (req.query.query as string || req.query.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ detail: 'Missing query parameter.' });
  }

  try {
    const participant = await lookupParticipant(query);
    if (!participant) {
      return res.status(404).json({ detail: `No registration found matching "${query}".` });
    }

    return res.status(200).json(participant);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
