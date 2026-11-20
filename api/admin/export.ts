import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllParticipants } from '../_lib/supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const participants = await getAllParticipants();
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
        'Category',
        'Height',
        'Instagram',
        'Total Fee (INR)',
        'Amount Paid (INR)',
        'Balance Due (INR)',
        'Status',
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
        p.created_at,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="skyra_participants_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    return res.status(500).json({ detail: err.message });
  }
}
