import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getActiveDatabaseDriver } from './_lib/database';
import { isMongoHealthy } from './_lib/mongoClient';
import { isSupabaseConfigured } from './_lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const driver = await getActiveDatabaseDriver();
  const mongoOk = process.env.MONGODB_URI ? await isMongoHealthy() : null;

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'skyra-creations-api',
    version: '2.0.0',
    uptime: process.uptime(),
    database: {
      activeDriver: driver,
      mongoConfigured: Boolean(process.env.MONGODB_URI),
      mongoHealthy: mongoOk,
      supabaseConfigured: isSupabaseConfigured,
    },
  });
}
