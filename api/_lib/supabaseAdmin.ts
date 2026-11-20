import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    }
    supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}

// In-memory fallback repository for local testing before user plugs in Supabase keys
interface InMemParticipant {
  id: string;
  reg_id: string;
  full_name: string;
  email: string;
  dob: string;
  gender: string;
  mobile: string;
  whatsapp: string;
  city: string;
  category: string;
  height?: string | null;
  instagram?: string | null;
  experience?: string | null;
  total_fee: number;
  amount_paid: number;
  balance_due: number;
  status: 'PENDING_VERIFICATION' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

interface InMemPayment {
  id: string;
  payment_id: string;
  participant_id: string;
  reg_id: string;
  payment_type: 'INITIAL_REGISTRATION' | 'BALANCE_PAYMENT';
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejection_reason?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
}

interface InMemAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// Seed memory store with sample data
let memParticipants: InMemParticipant[] = [
  {
    id: 'p-1',
    reg_id: 'SC-2026-1001',
    full_name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    dob: '14-07-2002',
    gender: 'Female',
    mobile: '+919840123456',
    whatsapp: '+919840123456',
    city: 'Chennai',
    category: 'Runway Model',
    height: '5ft 9in',
    instagram: '@ananya_runway',
    experience: 'Walked in Chennai Fashion Week 2025',
    total_fee: 5000,
    amount_paid: 5000,
    balance_due: 0,
    status: 'FULLY_PAID',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-2',
    reg_id: 'SC-2026-1002',
    full_name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    dob: '22-11-2001',
    gender: 'Male',
    mobile: '+919712345678',
    whatsapp: '+919712345678',
    city: 'Bengaluru',
    category: 'Runway Model',
    height: '6ft 1in',
    instagram: '@rohan_v_style',
    experience: 'College pageant winner',
    total_fee: 5000,
    amount_paid: 2000,
    balance_due: 3000,
    status: 'PARTIALLY_PAID',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-3',
    reg_id: 'SC-2026-1003',
    full_name: 'Meera Krishnan',
    email: 'meera.krish@example.com',
    dob: '05-03-2003',
    gender: 'Female',
    mobile: '+919445123987',
    whatsapp: '+919445123987',
    city: 'Coimbatore',
    category: 'Teen / Fresher Runway',
    height: '5ft 7in',
    instagram: '@meera.k_fashion',
    experience: 'Fresher looking for first runway launch',
    total_fee: 5000,
    amount_paid: 0,
    balance_due: 5000,
    status: 'PENDING_VERIFICATION',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let memPayments: InMemPayment[] = [
  {
    id: 'pay-1',
    payment_id: 'PAY-REG-1001A',
    participant_id: 'p-1',
    reg_id: 'SC-2026-1001',
    payment_type: 'INITIAL_REGISTRATION',
    amount: 2500,
    transaction_id: 'UPI/428901823901',
    r2_object_key: 'proofs/sample_1.png',
    status: 'VERIFIED',
    verified_by: 'Admin',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    payment_id: 'PAY-BAL-1001B',
    participant_id: 'p-1',
    reg_id: 'SC-2026-1001',
    payment_type: 'BALANCE_PAYMENT',
    amount: 2500,
    transaction_id: 'UPI/428999482103',
    r2_object_key: 'proofs/sample_2.png',
    status: 'VERIFIED',
    verified_by: 'Admin',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'pay-3',
    payment_id: 'PAY-REG-1002A',
    participant_id: 'p-2',
    reg_id: 'SC-2026-1002',
    payment_type: 'INITIAL_REGISTRATION',
    amount: 2000,
    transaction_id: 'UPI/429103948572',
    r2_object_key: 'proofs/sample_3.png',
    status: 'VERIFIED',
    verified_by: 'Admin',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'pay-4',
    payment_id: 'PAY-REG-1003A',
    participant_id: 'p-3',
    reg_id: 'SC-2026-1003',
    payment_type: 'INITIAL_REGISTRATION',
    amount: 1500,
    transaction_id: 'UPI/430019283741',
    r2_object_key: 'proofs/sample_4.png',
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
];

let memAuditLogs: InMemAuditLog[] = [];

// ==============================================================================
// REPOSITORY METHODS (Abstracts Supabase vs Local Store)
// ==============================================================================

export async function lookupParticipant(query: string) {
  const q = query.trim().toLowerCase();

  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data: p, error } = await supabase
      .from('participants')
      .select('*, payments(*)')
      .or(`reg_id.ilike.%${q}%,mobile.eq.${q},email.ilike.%${q}%`)
      .order('created_at', { referencedTable: 'payments', ascending: false })
      .maybeSingle();

    if (error) throw error;
    return p;
  }

  // Fallback memory query
  const p = memParticipants.find(
    (item) =>
      item.reg_id.toLowerCase() === q ||
      item.mobile.toLowerCase() === q ||
      item.email.toLowerCase() === q
  );

  if (!p) return null;
  const payments = memPayments.filter((pay) => pay.participant_id === p.id);
  return { ...p, payments };
}

export async function createParticipantAndPayment(params: {
  participantData: Omit<InMemParticipant, 'id' | 'reg_id' | 'amount_paid' | 'balance_due' | 'status' | 'created_at' | 'updated_at'>;
  paymentData: {
    amount: number;
    transaction_id: string;
    r2_object_key: string;
    file_mime?: string;
    file_size?: number;
  };
}) {
  const { participantData, paymentData } = params;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    
    // Check existing email/mobile
    const { data: existing } = await supabase
      .from('participants')
      .select('reg_id')
      .or(`email.eq.${participantData.email},mobile.eq.${participantData.mobile}`)
      .maybeSingle();

    if (existing) {
      throw new Error(`Already registered under Registration ID ${existing.reg_id}. Use Balance Payment.`);
    }

    const { count } = await supabase.from('participants').select('*', { count: 'exact', head: true });
    const reg_id = `SC-2026-${(count || 0) + 1004}`;

    const { data: participant, error: pErr } = await supabase
      .from('participants')
      .insert({
        ...participantData,
        reg_id,
        amount_paid: 0.00,
        balance_due: participantData.total_fee,
        status: 'PENDING_VERIFICATION',
      })
      .select()
      .single();

    if (pErr) throw pErr;

    const payment_id = `PAY-REG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        payment_id,
        participant_id: participant.id,
        reg_id: participant.reg_id,
        payment_type: 'INITIAL_REGISTRATION',
        amount: paymentData.amount,
        transaction_id: paymentData.transaction_id,
        r2_object_key: paymentData.r2_object_key,
        file_mime: paymentData.file_mime,
        file_size: paymentData.file_size,
        status: 'PENDING',
      })
      .select()
      .single();

    if (payErr) throw payErr;
    return { participant, payment };
  }

  // Fallback memory
  const existing = memParticipants.find(
    (p) => p.email === participantData.email || p.mobile === participantData.mobile
  );
  if (existing) {
    throw new Error(`Already registered under Registration ID ${existing.reg_id}. Use Balance Payment.`);
  }

  const reg_id = `SC-2026-${memParticipants.length + 1004}`;
  const pId = `p-${Date.now()}`;
  const newParticipant: InMemParticipant = {
    ...participantData,
    id: pId,
    reg_id,
    amount_paid: 0,
    balance_due: participantData.total_fee,
    status: 'PENDING_VERIFICATION',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memParticipants.push(newParticipant);

  const payment_id = `PAY-REG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const newPayment: InMemPayment = {
    id: `pay-${Date.now()}`,
    payment_id,
    participant_id: pId,
    reg_id,
    payment_type: 'INITIAL_REGISTRATION',
    amount: paymentData.amount,
    transaction_id: paymentData.transaction_id,
    r2_object_key: paymentData.r2_object_key,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };
  memPayments.push(newPayment);

  return { participant: newParticipant, payment: newPayment };
}

export async function addBalancePayment(params: {
  reg_id: string;
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  file_mime?: string;
  file_size?: number;
}) {
  const { reg_id, amount, transaction_id, r2_object_key, file_mime, file_size } = params;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data: participant, error: pErr } = await supabase
      .from('participants')
      .select('id, balance_due, full_name, reg_id')
      .ilike('reg_id', reg_id)
      .single();

    if (pErr || !participant) {
      throw new Error(`Registration ID ${reg_id} was not found.`);
    }

    const payment_id = `PAY-BAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        payment_id,
        participant_id: participant.id,
        reg_id,
        payment_type: 'BALANCE_PAYMENT',
        amount,
        transaction_id,
        r2_object_key,
        file_mime,
        file_size,
        status: 'PENDING',
      })
      .select()
      .single();

    if (payErr) throw payErr;
    return { participant, payment };
  }

  // Fallback memory
  const p = memParticipants.find((item) => item.reg_id.toUpperCase() === reg_id.toUpperCase());
  if (!p) throw new Error(`Registration ID ${reg_id} was not found.`);

  const payment_id = `PAY-BAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const newPayment: InMemPayment = {
    id: `pay-${Date.now()}`,
    payment_id,
    participant_id: p.id,
    reg_id: p.reg_id,
    payment_type: 'BALANCE_PAYMENT',
    amount,
    transaction_id,
    r2_object_key,
    status: 'PENDING',
    created_at: new Date().toISOString(),
  };
  memPayments.push(newPayment);

  return { participant: p, payment: newPayment };
}

export async function verifyPaymentRecord(params: {
  payment_id: string;
  action: 'VERIFY' | 'REJECT';
  reason?: string;
  adminName: string;
  ipAddress?: string;
}) {
  const { payment_id, action, reason, adminName, ipAddress } = params;

  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const newStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        rejection_reason: action === 'REJECT' ? reason : null,
        verified_by: adminName,
        verified_at: new Date().toISOString(),
      })
      .eq('payment_id', payment_id)
      .select('*, participant:participants(*)')
      .single();

    if (payErr || !payment) throw payErr || new Error('Payment not found');

    // Trigger recalculation in PostgreSQL
    await supabase.rpc('recalculate_participant_balance', { target_participant_id: payment.participant_id });

    // Record audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminName,
      action: `PAYMENT_${action}`,
      target_type: 'PAYMENT',
      target_id: payment_id,
      ip_address: ipAddress,
      details: { amount: payment.amount, reason },
    });

    return payment;
  }

  // Fallback memory
  const pay = memPayments.find((p) => p.payment_id === payment_id);
  if (!pay) throw new Error('Payment not found');

  pay.status = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
  pay.rejection_reason = action === 'REJECT' ? reason : null;
  pay.verified_by = adminName;
  pay.verified_at = new Date().toISOString();

  // Recalculate participant
  const p = memParticipants.find((item) => item.id === pay.participant_id);
  if (p) {
    const verifiedSum = memPayments
      .filter((m) => m.participant_id === p.id && m.status === 'VERIFIED')
      .reduce((sum, item) => sum + item.amount, 0);

    p.amount_paid = verifiedSum;
    p.balance_due = Math.max(0, p.total_fee - verifiedSum);

    if (verifiedSum >= p.total_fee) {
      p.status = 'FULLY_PAID';
    } else if (verifiedSum > 0) {
      p.status = 'PARTIALLY_PAID';
    } else if (memPayments.filter((m) => m.participant_id === p.id).every((m) => m.status === 'REJECTED')) {
      p.status = 'REJECTED';
    } else {
      p.status = 'PENDING_VERIFICATION';
    }
  }

  memAuditLogs.push({
    id: `audit-${Date.now()}`,
    admin_id: adminName,
    action: `PAYMENT_${action}`,
    target_type: 'PAYMENT',
    target_id: payment_id,
    details: { amount: pay.amount, reason },
    ip_address: ipAddress,
    created_at: new Date().toISOString(),
  });

  return { ...pay, participant: p };
}

export async function getDashboardStats() {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data: participants } = await supabase.from('participants').select('status, balance_due');
    const { data: payments } = await supabase.from('payments').select('amount, status');

    const total_participants = participants?.length || 0;
    const verified_participants_count = participants?.filter((p) => p.status === 'FULLY_PAID' || p.status === 'PARTIALLY_PAID').length || 0;
    const partially_paid_count = participants?.filter((p) => p.status === 'PARTIALLY_PAID').length || 0;
    const fully_paid_count = participants?.filter((p) => p.status === 'FULLY_PAID').length || 0;
    const rejected_count = participants?.filter((p) => p.status === 'REJECTED').length || 0;
    const total_balance_due = participants?.reduce((acc, p) => acc + Number(p.balance_due || 0), 0) || 0;

    const total_verified_revenue = payments?.filter((p) => p.status === 'VERIFIED').reduce((acc, p) => acc + Number(p.amount || 0), 0) || 0;
    const pending = payments?.filter((p) => p.status === 'PENDING') || [];
    const total_pending_amount = pending.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const pending_verifications_count = pending.length;

    return {
      total_participants,
      total_verified_revenue,
      total_pending_amount,
      total_balance_due,
      pending_verifications_count,
      verified_participants_count,
      partially_paid_count,
      fully_paid_count,
      rejected_count,
    };
  }

  // Memory stats
  const total_participants = memParticipants.length;
  const verified_participants_count = memParticipants.filter((p) => p.status === 'FULLY_PAID' || p.status === 'PARTIALLY_PAID').length;
  const partially_paid_count = memParticipants.filter((p) => p.status === 'PARTIALLY_PAID').length;
  const fully_paid_count = memParticipants.filter((p) => p.status === 'FULLY_PAID').length;
  const rejected_count = memParticipants.filter((p) => p.status === 'REJECTED').length;
  const total_balance_due = memParticipants.reduce((sum, p) => sum + p.balance_due, 0);

  const total_verified_revenue = memPayments
    .filter((p) => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + p.amount, 0);

  const pending = memPayments.filter((p) => p.status === 'PENDING');
  const total_pending_amount = pending.reduce((sum, p) => sum + p.amount, 0);
  const pending_verifications_count = pending.length;

  return {
    total_participants,
    total_verified_revenue,
    total_pending_amount,
    total_balance_due,
    pending_verifications_count,
    verified_participants_count,
    partially_paid_count,
    fully_paid_count,
    rejected_count,
  };
}

export async function getAllParticipants() {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('participants').select('*, payments(*)').order('created_at', { ascending: false });
    return data || [];
  }
  return memParticipants.map((p) => ({
    ...p,
    payments: memPayments.filter((pay) => pay.participant_id === p.id),
  }));
}

export async function getAllPayments() {
  if (isSupabaseConfigured) {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('payments').select('*, participant:participants(full_name, mobile, whatsapp, city)').order('created_at', { ascending: false });
    return data || [];
  }
  return memPayments.map((pay) => {
    const p = memParticipants.find((item) => item.id === pay.participant_id);
    return {
      ...pay,
      participant: p ? { full_name: p.full_name, mobile: p.mobile, whatsapp: p.whatsapp, city: p.city } : null,
    };
  });
}
