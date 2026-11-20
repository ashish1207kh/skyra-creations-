import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as archiverNamespace from 'archiver';
const archiver = (archiverNamespace as any).default || archiverNamespace;
import fs from 'fs';
import path from 'path';
import { isR2Configured, getObjectStream } from '../_lib/r2Client.js';
import { getAllPayments } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const selectedKeys = req.query.keys ? (req.query.keys as string).split(',') : null;

  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `skyra_event_photos_${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    archive.pipe(res);

    let keysToInclude: string[] = [];
    if (selectedKeys && selectedKeys.length > 0) {
      keysToInclude = selectedKeys;
    } else {
      const allPayments = await getAllPayments();
      keysToInclude = allPayments.map((p: any) => p.r2_object_key).filter(Boolean);
    }

    if (!isR2Configured) {
      // Local development fallback: bundle available sample images
      const samplePath = path.resolve(process.cwd(), 'public', 'qr_code.png');
      if (fs.existsSync(samplePath)) {
        const stream = fs.createReadStream(samplePath);
        archive.append(stream, { name: 'sample_payment_proof.png' });
      }
      archive.append(
        Buffer.from('Manifest of requested keys:\n' + keysToInclude.join('\n')),
        { name: 'download_manifest.txt' }
      );
    } else {
      for (const key of keysToInclude) {
        try {
          const bodyStream = await getObjectStream(key);
          if (bodyStream) {
            const entryName = path.basename(key);
            archive.append(bodyStream as any, { name: entryName });
          }
        } catch (e) {
          console.error(`Error fetching key ${key} from R2`, e);
        }
      }
    }

    await archive.finalize();
  } catch (err: any) {
    console.error('ZIP archive error', err);
    if (!res.headersSent) {
      return res.status(500).json({ detail: err.message });
    }
  }
}
