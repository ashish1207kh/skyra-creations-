import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import * as archiverNamespace from 'archiver';
const archiver = (archiverNamespace as any).default || archiverNamespace;
import fs from 'fs';
import path from 'path';

import { createAdminSession, verifyAdminAuth } from '../_lib/adminAuth.js';
import { 
  getDashboardStats, 
  listRegistrations, 
  listAllPayments, 
  updatePaymentVerification,
  getStorageMetrics
} from '../_lib/database.js';
import { 
  isSupabaseConfigured, 
  getSupabaseAdmin 
} from '../_lib/supabaseAdmin.js';
import { generatePresignedViewUrl, isR2Configured, getObjectStream } from '../_lib/r2Client.js';
import { checkRateLimit, sanitizeNoSqlInjection } from '../_lib/rateLimit.js';

const loginSchema = z.object({
  email: z.string().min(3),
  password: z.string().min(6),
});

const verifySchema = z.object({
  payment_id: z.string().min(1),
  action: z.enum(['VERIFY', 'REJECT']),
  rejection_reason: z.string().optional(),
  admin_name: z.string().optional(),
});

const CONFIGURED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@skyracreations.com';
const CONFIGURED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SkyraDirector@Runway2026';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  const rawAction = (req.query.action as string) || (req.url?.split('?')[0].split('/').pop() || '');
  const action = rawAction.toLowerCase();

  // 1. POST /api/admin/login
  if (action === 'login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const clientIp = (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const { allowed } = checkRateLimit(clientIp + ':admin_login', 5, 60);
    if (!allowed) {
      return res.status(429).json({ detail: 'Too many login attempts. Please wait 1 minute.' });
    }

    if (!sanitizeNoSqlInjection(req.body)) {
      return res.status(400).json({ detail: 'Invalid characters in login credentials.' });
    }

    try {
      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured) {
        const supabase = getSupabaseAdmin();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (!authError && authData.session) {
          const token = createAdminSession(normalizedEmail, 'superadmin');
          return res.status(200).json({
            success: true,
            token,
            user: {
              email: normalizedEmail,
              role: 'superadmin',
              name: 'Skyra Operations Director',
            },
          });
        }
      }

      const isEmailMatch = (normalizedEmail === CONFIGURED_ADMIN_EMAIL.toLowerCase()) || 
                           (normalizedEmail === 'admin');
      const isPasswordMatch = (password === CONFIGURED_ADMIN_PASSWORD);

      if (isEmailMatch && isPasswordMatch) {
        const token = createAdminSession(CONFIGURED_ADMIN_EMAIL, 'superadmin');
        return res.status(200).json({
          success: true,
          token,
          user: {
            email: CONFIGURED_ADMIN_EMAIL,
            role: 'superadmin',
            name: 'Skyra Operations Director',
          },
        });
      }

      return res.status(401).json({ detail: 'Invalid administrator email or password.' });
    } catch (err: any) {
      const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
      return res.status(400).json({ detail: msg || 'Invalid request payload.' });
    }
  }

  // All subsequent routes require Admin Auth
  const auth = verifyAdminAuth(req);
  if (!auth.valid) {
    return res.status(401).json({ detail: auth.error || 'Unauthorized' });
  }

  // 2. GET /api/admin/stats
  if (action === 'stats') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }
    try {
      const stats = await getDashboardStats();
      return res.status(200).json(stats);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  // 3. GET /api/admin/participants
  if (action === 'participants') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const pagination = page ? { page, limit: limit || 20 } : undefined;
      const participants = await listRegistrations(undefined, false, pagination);
      return res.status(200).json(participants);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  // 4. GET /api/admin/payments
  if (action === 'payments') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }
    try {
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const pagination = page ? { page, limit: limit || 20 } : undefined;
      const rawRes = await listAllPayments(pagination);

      // Handle paginated object { items, total, page, totalPages }
      if (rawRes && Array.isArray(rawRes.items)) {
        const paymentsWithUrls = await Promise.all(
          rawRes.items.map(async (pay: any) => {
            try {
              const view_url = await generatePresignedViewUrl(pay.r2_object_key);
              return { ...pay, view_url };
            } catch {
              return { ...pay, view_url: '/logo.png' };
            }
          })
        );
        return res.status(200).json({
          ...rawRes,
          items: paymentsWithUrls,
        });
      }

      // Backward compatible array response
      const paymentsWithUrls = await Promise.all(
        (rawRes || []).map(async (pay: any) => {
          try {
            const view_url = await generatePresignedViewUrl(pay.r2_object_key);
            return { ...pay, view_url };
          } catch {
            return { ...pay, view_url: '/logo.png' };
          }
        })
      );
      return res.status(200).json(paymentsWithUrls);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  // 4.5. GET /api/admin/storage-stats (MongoDB 512 MB Storage Monitoring)
  if (action === 'storage-stats') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }
    try {
      const storageMetrics = await getStorageMetrics();
      return res.status(200).json(storageMetrics);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  // 5. POST /api/admin/verify-payment
  if (action === 'verify-payment') {
    if (req.method !== 'POST') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    const clientIp = (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';

    try {
      const data = verifySchema.parse(req.body);

      if (data.action === 'REJECT' && (!data.rejection_reason || data.rejection_reason.trim().length === 0)) {
        return res.status(400).json({ detail: 'A mandatory rejection reason is required to reject a payment.' });
      }

      const adminDisplayName = data.admin_name || auth.session?.email || 'Operations Director';

      const result = await updatePaymentVerification(
        data.payment_id,
        undefined,
        data.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED',
        adminDisplayName,
        data.rejection_reason
      );

      return res.status(200).json({
        success: true,
        message: `Payment ${data.payment_id} has been marked as ${data.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED'}.`,
        result,
      });
    } catch (err: any) {
      const msg = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
      return res.status(400).json({ detail: msg });
    }
  }

  // 6. GET /api/admin/export
  if (action === 'export') {
    if (req.method !== 'GET') {
      return res.status(405).json({ detail: 'Method not allowed' });
    }

    try {
      const participants = await listRegistrations();
      const rows = [
        [
          'Registration ID',
          'Full Name',
          'Email',
          'Mobile',
          'WhatsApp',
          'City',
          'Gender',
          'Date of Birth',
          'Participation Category',
          'Height',
          'Instagram',
          'Total Fee (INR)',
          'Verified Amount Paid (INR)',
          'Outstanding Balance (INR)',
          'Registration Status',
          'Model Photo Key',
          'Terms Version',
          'Registration Date',
        ],
        ...participants.map((p: any) => [
          p.reg_id,
          p.full_name,
          p.email,
          p.mobile,
          p.whatsapp,
          p.city,
          p.gender,
          p.dob,
          p.category,
          p.height || '',
          p.instagram || '',
          p.total_fee,
          p.amount_paid,
          p.balance_due,
          p.status,
          p.model_photo_r2_key || '',
          p.terms_version || '2026.2',
          p.created_at,
        ]),
      ];

      const csvContent = rows
        .map((row) =>
          row
            .map((cell: any) => {
              const str = String(cell ?? '').replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        )
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="skyra_registry_${Date.now()}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err: any) {
      return res.status(500).json({ detail: err.message });
    }
  }

  // 7. GET /api/admin/download-zip
  if (action === 'download-zip') {
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
        const allPayments = await listAllPayments();
        keysToInclude = allPayments.map((p: any) => p.r2_object_key).filter(Boolean);
      }

      if (!isR2Configured) {
        const samplePath = path.resolve(process.cwd(), 'public', 'logo.png');
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
          } catch (fileErr) {
            console.error(`Failed to stream object ${key}:`, fileErr);
          }
        }
      }

      await archive.finalize();
    } catch (err: any) {
      if (!res.headersSent) {
        return res.status(500).json({ detail: err.message });
      }
    }
    return;
  }

  return res.status(404).json({ detail: `Admin action '${action}' not found.` });
}
