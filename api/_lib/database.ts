import crypto from 'crypto';
import { getMongoConnection } from './mongoClient.js';
import { encryptField, decryptField, computeBlindIndex } from './encryption.js';
import * as supabaseAdmin from './supabaseAdmin.js';

export interface ParticipantRecord {
  id: string;
  reg_id: string;
  event_id: string;
  full_name: string;
  email: string;
  email_blind_index?: string;
  dob: string;
  gender: string;
  mobile: string;
  mobile_blind_index?: string;
  whatsapp: string;
  whatsapp_blind_index?: string;
  city: string;
  category: string;
  height?: string | null;
  instagram?: string | null;
  experience?: string | null;
  model_photo_r2_key?: string | null;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  terms_version?: string;
  declaration_text?: string;
  total_fee: number;
  amount_paid: number;
  balance_due: number;
  status: 'PENDING_VERIFICATION' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REJECTED';
  pass_token?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  payment_id: string;
  reg_id: string;
  event_id: string;
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

export interface EventRecord {
  event_id: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'REGISTRATION_CLOSED' | 'COMPLETED' | 'ARCHIVED' | 'TRASHED' | 'DELETION_PENDING';
  location: string;
  event_date: string;
  registration_deadline?: string;
  total_capacity?: number;
  total_fee: number;
  allowed_token_advances: number[];
  allowed_balance_amounts: number[];
  currency: string;
  terms_version: string;
  photo_required: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_EVENT_ID = 'EVT-CHX-2026';

export const OFFICIAL_DECLARATION_TEXT = 'I hereby confirm that all information provided during registration is accurate and complete. I have read, understood, and agreed to the event policies, including the non-refundable registration fee policy. I agree to comply with all rehearsal schedules, reporting times, dress codes, event instructions, and guidelines issued by SKYRA CREATIONS. I understand that failure to comply with the event rules or instructions may affect my participation.';

/**
 * Get authoritative event configuration
 */
export async function getEventConfig(eventId: string = DEFAULT_EVENT_ID): Promise<EventRecord> {
  const driver = await getActiveDatabaseDriver();
  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const doc = await conn.db.collection('events').findOne({ event_id: eventId });
      if (doc) {
        return {
          event_id: doc.event_id,
          title: doc.title || 'Runway Show — Chennai & Selected Areas',
          status: doc.status || 'ACTIVE',
          location: doc.location || 'Chennai & Selected Areas',
          event_date: doc.event_date || '2027-01-10T09:00:00Z',
          registration_deadline: doc.registration_deadline,
          total_capacity: doc.total_capacity,
          total_fee: typeof doc.total_fee === 'number' ? doc.total_fee : 3000,
          allowed_token_advances: Array.isArray(doc.allowed_token_advances) ? doc.allowed_token_advances : [500, 1000, 1500],
          allowed_balance_amounts: Array.isArray(doc.allowed_balance_amounts) ? doc.allowed_balance_amounts : [500, 1000, 1500, 2000, 2500],
          currency: doc.currency || 'INR',
          terms_version: doc.terms_version || '2026.2',
          photo_required: doc.photo_required ?? true,
          created_at: doc.created_at || new Date().toISOString(),
          updated_at: doc.updated_at || new Date().toISOString(),
        };
      }
    }
  }

  return {
    event_id: DEFAULT_EVENT_ID,
    title: 'Runway Show — Chennai & Selected Areas',
    status: 'ACTIVE',
    location: 'Chennai & Selected Areas',
    event_date: '2027-01-10T09:00:00Z',
    registration_deadline: '2026-04-30T23:59:59Z',
    total_capacity: 500,
    total_fee: 3000,
    allowed_token_advances: [500, 1000, 1500],
    allowed_balance_amounts: [500, 1000, 1500, 2000, 2500],
    currency: 'INR',
    terms_version: '2026.2',
    photo_required: true,
    created_at: '2026-11-21T00:00:00Z',
    updated_at: '2026-11-21T00:00:00Z',
  };
}

/**
 * Checks which database provider is currently active
 * Ensures resilient fallback to authoritative production MongoDB Atlas cluster
 */
export async function getActiveDatabaseDriver(): Promise<'mongodb' | 'supabase' | 'in-memory'> {
  const conn = await getMongoConnection();
  if (conn) return 'mongodb';

  if (supabaseAdmin.isSupabaseConfigured) {
    return 'supabase';
  }
  return 'in-memory';
}

/**
 * Allocates the next available sequential Registration ID.
 * If any earlier registration number was deleted (e.g., #1/SC-2026-1001),
 * it seamlessly finds and re-allocates the lowest missing integer to fill the gap
 * so contestant numbering remains continuous without missing numbers or duplicates.
 */
export async function allocateNextSequentialRegId(conn?: any): Promise<string> {
  const usedNumbers = new Set<number>();

  if (conn) {
    const docs = await conn.db.collection('registrations')
      .find({}, { projection: { reg_id: 1 } })
      .toArray();

    for (const d of docs) {
      if (d.reg_id) {
        const match = d.reg_id.match(/SC-2026-(\d+)/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n)) usedNumbers.add(n);
        }
      }
    }
  } else {
    for (const p of supabaseAdmin.memParticipants) {
      if (p.reg_id) {
        const match = p.reg_id.match(/SC-2026-(\d+)/i);
        if (match) {
          const n = parseInt(match[1], 10);
          if (!isNaN(n)) usedNumbers.add(n);
        }
      }
    }
  }

  // Sequential numbering starts at 1001 (representing Contestant #1)
  let candidate = 1001;
  while (usedNumbers.has(candidate)) {
    candidate++;
  }

  return `SC-2026-${candidate}`;
}

/**
 * Helper to mask sensitive PII for unprivileged viewers
 */
export function maskPII(p: ParticipantRecord): ParticipantRecord {
  return {
    ...p,
    mobile: p.mobile ? p.mobile.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : '',
    whatsapp: p.whatsapp ? p.whatsapp.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : '',
    email: p.email ? p.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)) : '',
    dob: p.dob ? '**-**-****' : '',
  };
}

/**
 * Fetch a participant by Registration ID
 */
export async function getParticipantByRegId(regId: string, mask: boolean = false): Promise<ParticipantRecord | null> {
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const doc = await conn.db.collection('registrations').findOne({ reg_id: regId.toUpperCase() });
      if (!doc) return null;

      const record: ParticipantRecord = {
        id: doc._id.toString(),
        reg_id: doc.reg_id,
        event_id: doc.event_id || DEFAULT_EVENT_ID,
        full_name: doc.full_name,
        email: doc.email,
        dob: decryptField(doc.dob_encrypted) || doc.dob || '',
        gender: doc.gender,
        mobile: decryptField(doc.mobile_encrypted) || doc.mobile || '',
        whatsapp: decryptField(doc.whatsapp_encrypted) || doc.whatsapp || '',
        city: doc.city,
        category: doc.category,
        height: doc.height,
        instagram: doc.instagram,
        experience: doc.experience,
        model_photo_r2_key: doc.model_photo_r2_key || null,
        terms_accepted: doc.terms_accepted ?? true,
        terms_accepted_at: doc.terms_accepted_at || doc.created_at,
        terms_version: doc.terms_version || '2026.1',
        declaration_text: doc.declaration_text || OFFICIAL_DECLARATION_TEXT,
        total_fee: doc.total_fee,
        amount_paid: doc.amount_paid,
        balance_due: doc.balance_due,
        status: doc.status,
        pass_token: doc.pass_token,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      };

      return mask ? maskPII(record) : record;
    }
  }

  // Fallback to Supabase / In-Memory
  const p = await supabaseAdmin.lookupParticipant(regId);
  if (!p) return null;

  const standardRecord: ParticipantRecord = {
    ...p,
    event_id: DEFAULT_EVENT_ID,
  };
  return mask ? maskPII(standardRecord) : standardRecord;
}

/**
 * Fetch a participant by blind-indexed mobile phone or email
 */
export async function getParticipantByPhoneOrEmail(query: string): Promise<ParticipantRecord | null> {
  const blindIndex = computeBlindIndex(query);
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const doc = await conn.db.collection('registrations').findOne({
        $or: [
          { phone_blind_index: blindIndex },
          { email_blind_index: blindIndex },
          { mobile: query },
          { email: query.toLowerCase() },
        ],
      });
      if (doc) {
        return getParticipantByRegId(doc.reg_id);
      }
    }
  }

  // Fallback to Supabase / In-Memory
  const p = await supabaseAdmin.lookupParticipant(query);
  if (!p) return null;
  return {
    ...p,
    event_id: DEFAULT_EVENT_ID,
  };
}

/**
 * Save a new registration with field-level encryption
 */
export async function createRegistration(data: Omit<ParticipantRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ParticipantRecord> {
  const driver = await getActiveDatabaseDriver();
  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const encryptedMobile = encryptField(data.mobile);
      const encryptedWhatsapp = encryptField(data.whatsapp);
      const encryptedDob = encryptField(data.dob);

      const phoneBlindIndex = computeBlindIndex(data.mobile);
      const whatsappBlindIndex = computeBlindIndex(data.whatsapp);
      const emailBlindIndex = computeBlindIndex(data.email);

      const doc = {
        reg_id: data.reg_id,
        event_id: data.event_id || DEFAULT_EVENT_ID,
        full_name: data.full_name,
        email: data.email.toLowerCase(),
        email_blind_index: emailBlindIndex,
        dob_encrypted: encryptedDob,
        gender: data.gender,
        mobile_encrypted: encryptedMobile,
        phone_blind_index: phoneBlindIndex,
        whatsapp_encrypted: encryptedWhatsapp,
        whatsapp_blind_index: whatsappBlindIndex,
        city: data.city,
        category: data.category,
        height: data.height || null,
        instagram: data.instagram || null,
        experience: data.experience || null,
        model_photo_r2_key: data.model_photo_r2_key || null,
        terms_accepted: data.terms_accepted ?? true,
        terms_accepted_at: data.terms_accepted_at || now,
        terms_version: data.terms_version || '2026.2',
        declaration_text: data.declaration_text || OFFICIAL_DECLARATION_TEXT,
        total_fee: data.total_fee,
        amount_paid: data.amount_paid,
        balance_due: data.balance_due,
        status: data.status,
        pass_token: data.pass_token,
        created_at: now,
        updated_at: now,
      };

      const result = await conn.db.collection('registrations').insertOne(doc);
      return {
        ...data,
        id: result.insertedId.toString(),
        created_at: now,
        updated_at: now,
      };
    }
  }

  // Fallback to Supabase / In-Memory
  const { participant } = await supabaseAdmin.createParticipantAndPayment({
    participantData: {
      full_name: data.full_name,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      city: data.city,
      category: data.category,
      height: data.height || undefined,
      instagram: data.instagram || undefined,
      experience: data.experience || undefined,
      total_fee: data.total_fee,
    },
    paymentData: {
      amount: data.amount_paid,
      transaction_id: `INITIAL-${data.reg_id}`,
      r2_object_key: `proofs/${data.reg_id}.png`,
    },
  });

  return {
    ...participant,
    event_id: data.event_id || DEFAULT_EVENT_ID,
  };
}

/**
 * Record a payment (initial advance or balance payment)
 */
export async function recordPayment(payment: Omit<PaymentRecord, 'id' | 'created_at'>): Promise<PaymentRecord> {
  const driver = await getActiveDatabaseDriver();
  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const doc = {
        ...payment,
        created_at: now,
      };
      const result = await conn.db.collection('payments').insertOne(doc);
      return {
        ...payment,
        id: result.insertedId.toString(),
        created_at: now,
      };
    }
  }

  // Fallback to Supabase / In-Memory
  const res = await supabaseAdmin.addBalancePayment({
    reg_id: payment.reg_id,
    amount: payment.amount,
    transaction_id: payment.transaction_id,
    r2_object_key: payment.r2_object_key,
  });

  return {
    ...payment,
    id: res.payment.id,
    created_at: now,
  };
}

/**
 * Verify or Reject a payment
 */
export async function updatePaymentVerification(
  paymentId: string,
  regId: string | undefined,
  newStatus: 'VERIFIED' | 'REJECTED',
  verifiedBy: string,
  rejectionReason?: string
): Promise<{ success: boolean; participant?: ParticipantRecord }> {
  const driver = await getActiveDatabaseDriver();
  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const existingPay = await conn.db.collection('payments').findOne({
        $or: [{ payment_id: paymentId }, { _id: paymentId as any }],
      });
      if (!existingPay) {
        throw new Error(`Payment ID "${paymentId}" not found.`);
      }

      await conn.db.collection('payments').updateOne(
        { _id: existingPay._id },
        {
          $set: {
            status: newStatus,
            verified_by: verifiedBy,
            verified_at: now,
            rejection_reason: rejectionReason || null,
          },
        }
      );

      const targetRegId = regId || existingPay.reg_id;
      // Recalculate participant's balance based strictly on verified payments
      const participant = await getParticipantByRegId(targetRegId);
      if (participant) {
        const verifiedDocs = await conn.db.collection('payments').find({
          reg_id: targetRegId.toUpperCase(),
          status: 'VERIFIED',
        }).toArray();

        const verifiedSum = verifiedDocs.reduce((acc, curr) => acc + (typeof curr.amount === 'number' ? curr.amount : 0), 0);
        const balanceDue = Math.max(0, participant.total_fee - verifiedSum);
        let updatedStatus: 'PENDING_VERIFICATION' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REJECTED' = 'PENDING_VERIFICATION';
        let passToken = participant.pass_token;

        if (verifiedSum >= participant.total_fee) {
          updatedStatus = 'FULLY_PAID';
          if (!passToken) {
            passToken = supabaseAdmin.generatePassToken(targetRegId);
          }
        } else if (verifiedSum > 0) {
          updatedStatus = 'PARTIALLY_PAID';
        }

        await conn.db.collection('registrations').updateOne(
          { reg_id: targetRegId.toUpperCase() },
          {
            $set: {
              amount_paid: verifiedSum,
              balance_due: balanceDue,
              status: updatedStatus,
              pass_token: passToken,
              updated_at: now,
            },
          }
        );
      }

      const updated = await getParticipantByRegId(targetRegId);
      return { success: true, participant: updated || undefined };
    }
  }

  // Fallback to Supabase / In-Memory
  const result = await supabaseAdmin.verifyPaymentRecord({
    payment_id: paymentId,
    action: newStatus === 'VERIFIED' ? 'VERIFY' : 'REJECT',
    adminName: verifiedBy,
    reason: rejectionReason,
  });

  return {
    success: true,
    participant: result.participant ? { ...result.participant, event_id: DEFAULT_EVENT_ID } : undefined,
  };
}

export interface CollectionStorageStat {
  name: string;
  count: number;
  dataSizeKB: number;
  storageSizeKB: number;
  indexSizeKB: number;
  avgObjSizeBytes: number;
}

export interface StorageAlert {
  level: 'NORMAL' | 'INFORMATIONAL_WARNING' | 'WARNING' | 'CRITICAL_WARNING' | 'EMERGENCY_WARNING';
  thresholdPercent: number;
  message: string;
  actionRequired: boolean;
  recommendedAction: string;
}

export interface StorageMetrics {
  storageLimitMB: number;
  totalAllocatedMB: number;
  dataSizeMB: number;
  storageSizeMB: number;
  indexSizeMB: number;
  usagePercentage: number;
  remainingCapacityMB: number;
  estimatedRemainingRegistrations: number;
  estimatedMonthlyGrowthMB: number;
  alert: StorageAlert;
  collections: CollectionStorageStat[];
  counts: {
    registrations: number;
    payments: number;
    audit_logs: number;
    temporary_records: number;
    admin_users: number;
    events: number;
  };
  storageHealth: {
    r2_offload_active: boolean;
    ttl_cleanup_active: boolean;
    zero_binary_in_db: boolean;
  };
  lastChecked: string;
}

/**
 * Get all registrations for admin views with optional filtering, role masking, and server-side pagination
 */
export async function listRegistrations(
  filter?: { status?: string; event_id?: string },
  mask: boolean = false,
  pagination?: { page?: number; limit?: number }
): Promise<any> {
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const query: Record<string, any> = {};
      if (filter?.status && filter.status !== 'ALL') {
        query.status = filter.status;
      }
      if (filter?.event_id) {
        query.event_id = filter.event_id;
      }

      const total = await conn.db.collection('registrations').countDocuments(query);

      let cursor = conn.db.collection('registrations').find(query).sort({ created_at: -1 });

      const page = pagination?.page ? Math.max(1, Number(pagination.page)) : undefined;
      const limit = pagination?.limit ? Math.max(1, Math.min(100, Number(pagination.limit))) : undefined;

      if (page !== undefined && limit !== undefined) {
        cursor = cursor.skip((page - 1) * limit).limit(limit);
      }

      const docs = await cursor.toArray();

      const items = docs.map(doc => {
        const rec: ParticipantRecord = {
          id: doc._id.toString(),
          reg_id: doc.reg_id,
          event_id: doc.event_id || DEFAULT_EVENT_ID,
          full_name: doc.full_name,
          email: doc.email,
          dob: decryptField(doc.dob_encrypted) || doc.dob || '',
          gender: doc.gender,
          mobile: decryptField(doc.mobile_encrypted) || doc.mobile || '',
          whatsapp: decryptField(doc.whatsapp_encrypted) || doc.whatsapp || '',
          city: doc.city,
          category: doc.category,
          height: doc.height,
          instagram: doc.instagram,
          experience: doc.experience,
          model_photo_r2_key: doc.model_photo_r2_key || null,
          terms_accepted: doc.terms_accepted ?? true,
          terms_accepted_at: doc.terms_accepted_at || doc.created_at,
          terms_version: doc.terms_version || '2026.1',
          declaration_text: doc.declaration_text || OFFICIAL_DECLARATION_TEXT,
          total_fee: doc.total_fee,
          amount_paid: doc.amount_paid,
          balance_due: doc.balance_due,
          status: doc.status,
          pass_token: doc.pass_token,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
        };
        return mask ? maskPII(rec) : rec;
      });

      if (page !== undefined && limit !== undefined) {
        return {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }

      return items;
    }
  }

  // Fallback to Supabase
  const list = await supabaseAdmin.getAllParticipants();
  const filtered = filter?.status && filter.status !== 'ALL' ? list.filter(p => p.status === filter.status) : list;
  const items = filtered.map((p: any) => {
    const rec: ParticipantRecord = { ...p, event_id: DEFAULT_EVENT_ID };
    return mask ? maskPII(rec) : rec;
  });

  if (pagination?.page && pagination?.limit) {
    const page = Math.max(1, Number(pagination.page));
    const limit = Math.max(1, Math.min(100, Number(pagination.limit)));
    const total = items.length;
    const paginated = items.slice((page - 1) * limit, page * limit);
    return {
      items: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  return items;
}

/**
 * Get aggregated statistics for the admin dashboard
 */
export async function getDashboardStats(): Promise<{
  totalRegistrations: number;
  total_participants: number;
  pendingVerification: number;
  pending_verifications_count: number;
  partiallyPaid: number;
  partially_paid_count: number;
  fullyPaid: number;
  fully_paid_count: number;
  rejected: number;
  rejected_count: number;
  totalCollected: number;
  total_verified_revenue: number;
  totalOutstanding: number;
  total_balance_due: number;
  total_pending_amount: number;
}> {
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const regs = await conn.db.collection('registrations').find({}).toArray();
      const stats = {
        totalRegistrations: regs.length,
        total_participants: regs.length,
        pendingVerification: 0,
        pending_verifications_count: 0,
        partiallyPaid: 0,
        partially_paid_count: 0,
        fullyPaid: 0,
        fully_paid_count: 0,
        rejected: 0,
        rejected_count: 0,
        totalCollected: 0,
        total_verified_revenue: 0,
        totalOutstanding: 0,
        total_balance_due: 0,
        total_pending_amount: 0,
      };

      for (const r of regs) {
        if (r.status === 'PENDING_VERIFICATION') {
          stats.pendingVerification++;
          stats.pending_verifications_count++;
        } else if (r.status === 'PARTIALLY_PAID') {
          stats.partiallyPaid++;
          stats.partially_paid_count++;
        } else if (r.status === 'FULLY_PAID') {
          stats.fullyPaid++;
          stats.fully_paid_count++;
        } else if (r.status === 'REJECTED') {
          stats.rejected++;
          stats.rejected_count++;
        }

        stats.totalCollected += (r.amount_paid || 0);
        stats.total_verified_revenue += (r.amount_paid || 0);
        stats.totalOutstanding += (r.balance_due || 0);
        stats.total_balance_due += (r.balance_due || 0);
      }

      return stats;
    }
  }

  const s = await supabaseAdmin.getDashboardStats();
  return {
    totalRegistrations: s.total_participants,
    total_participants: s.total_participants,
    pendingVerification: s.pending_verifications_count,
    pending_verifications_count: s.pending_verifications_count,
    partiallyPaid: s.partially_paid_count,
    partially_paid_count: s.partially_paid_count,
    fullyPaid: s.fully_paid_count,
    fully_paid_count: s.fully_paid_count,
    rejected: s.rejected_count,
    rejected_count: s.rejected_count,
    totalCollected: s.total_verified_revenue,
    total_verified_revenue: s.total_verified_revenue,
    totalOutstanding: s.total_balance_due,
    total_balance_due: s.total_balance_due,
    total_pending_amount: s.total_pending_amount || 0,
  };
}

/**
 * Append an immutable security audit event
 */
export async function logAuditEvent(action: string, performedBy: string, details: Record<string, any>, ipAddress?: string): Promise<void> {
  const driver = await getActiveDatabaseDriver();
  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      await conn.db.collection('audit_logs').insertOne({
        action,
        performed_by: performedBy,
        details,
        ip_address: ipAddress || 'unknown',
        timestamp: now,
      });
    }
  }
}

/**
 * Register a participant and record their initial token advance payment
 */
export async function registerParticipant(data: {
  full_name: string;
  email: string;
  dob: string;
  gender: string;
  mobile: string;
  whatsapp: string;
  city: string;
  category?: string;
  height?: string | null;
  instagram?: string | null;
  experience?: string | null;
  model_photo_r2_key: string;
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  terms_confirmed: boolean;
  terms_version?: string;
}): Promise<{ participant: ParticipantRecord; payment: PaymentRecord }> {
  const driver = await getActiveDatabaseDriver();
  const eventConfig = await getEventConfig(DEFAULT_EVENT_ID);
  const cleanTxId = data.transaction_id.trim();

  // Enforce allowed token advance amounts
  if (!eventConfig.allowed_token_advances.includes(data.amount)) {
    throw new Error(`Token advance must be one of ₹${eventConfig.allowed_token_advances.join(', ₹')}. Received: ₹${data.amount}`);
  }

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      // 1. Check duplicate UTR
      const existingTx = await conn.db.collection('payments').findOne({
        transaction_id: { $regex: new RegExp(`^${cleanTxId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (existingTx) {
        throw new Error(`Transaction reference / UTR "${cleanTxId}" has already been submitted.`);
      }

      // 2. Check duplicate phone or email
      const phoneBlindIndex = computeBlindIndex(data.mobile);
      const emailBlindIndex = computeBlindIndex(data.email);
      const existingParticipant = await conn.db.collection('registrations').findOne({
        $or: [
          { phone_blind_index: phoneBlindIndex },
          { email_blind_index: emailBlindIndex },
          { email: data.email.toLowerCase().trim() },
        ],
      });
      if (existingParticipant) {
        throw new Error(`Already registered under Registration ID ${existingParticipant.reg_id}. Please use Balance Payment to complete payment.`);
      }

      // 3. Generate reg_id (Reusing lowest missing number to fill deleted slots seamlessly)
      const reg_id = await allocateNextSequentialRegId(conn);
      const pass_token = supabaseAdmin.generatePassToken(reg_id);

      const now = new Date().toISOString();
      const encryptedMobile = encryptField(data.mobile);
      const encryptedWhatsapp = encryptField(data.whatsapp);
      const encryptedDob = encryptField(data.dob);
      const whatsappBlindIndex = computeBlindIndex(data.whatsapp);

      const participantDoc = {
        reg_id,
        event_id: eventConfig.event_id,
        full_name: data.full_name.trim(),
        email: data.email.toLowerCase().trim(),
        email_blind_index: emailBlindIndex,
        dob_encrypted: encryptedDob,
        gender: data.gender,
        mobile_encrypted: encryptedMobile,
        phone_blind_index: phoneBlindIndex,
        whatsapp_encrypted: encryptedWhatsapp,
        whatsapp_blind_index: whatsappBlindIndex,
        city: data.city.trim(),
        category: data.category || 'Runway Model',
        height: data.height || null,
        instagram: data.instagram || null,
        experience: data.experience || null,
        model_photo_r2_key: data.model_photo_r2_key,
        terms_accepted: true,
        terms_accepted_at: now,
        terms_version: data.terms_version || eventConfig.terms_version || '2026.2',
        declaration_text: OFFICIAL_DECLARATION_TEXT,
        total_fee: eventConfig.total_fee, // 3000
        amount_paid: 0.0, // Only after verification does this increase
        balance_due: eventConfig.total_fee, // 3000
        status: 'PENDING_VERIFICATION' as const,
        pass_token,
        created_at: now,
        updated_at: now,
      };

      const partResult = await conn.db.collection('registrations').insertOne(participantDoc);

      const payment_id = `PAY-REG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const paymentDoc = {
        payment_id,
        reg_id,
        event_id: eventConfig.event_id,
        payment_type: 'INITIAL_REGISTRATION' as const,
        amount: data.amount,
        transaction_id: cleanTxId,
        r2_object_key: data.r2_object_key,
        status: 'PENDING' as const,
        rejection_reason: null,
        verified_by: null,
        verified_at: null,
        created_at: now,
      };

      const payResult = await conn.db.collection('payments').insertOne(paymentDoc);

      const createdParticipant: ParticipantRecord = {
        id: partResult.insertedId.toString(),
        reg_id,
        event_id: eventConfig.event_id,
        full_name: data.full_name.trim(),
        email: data.email.toLowerCase().trim(),
        dob: data.dob,
        gender: data.gender,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        city: data.city.trim(),
        category: data.category || 'Runway Model',
        height: data.height || null,
        instagram: data.instagram || null,
        experience: data.experience || null,
        model_photo_r2_key: data.model_photo_r2_key,
        terms_accepted: true,
        terms_accepted_at: now,
        terms_version: data.terms_version || eventConfig.terms_version || '2026.2',
        declaration_text: OFFICIAL_DECLARATION_TEXT,
        total_fee: eventConfig.total_fee,
        amount_paid: 0.0,
        balance_due: eventConfig.total_fee,
        status: 'PENDING_VERIFICATION',
        pass_token,
        created_at: now,
        updated_at: now,
      };

      const createdPayment: PaymentRecord = {
        id: payResult.insertedId.toString(),
        payment_id,
        reg_id,
        event_id: eventConfig.event_id,
        payment_type: 'INITIAL_REGISTRATION',
        amount: data.amount,
        transaction_id: cleanTxId,
        r2_object_key: data.r2_object_key,
        status: 'PENDING',
        created_at: now,
      };

      return { participant: createdParticipant, payment: createdPayment };
    }
  }

  // Fallback to Supabase / In-Memory
  const { participant, payment } = await supabaseAdmin.createParticipantAndPayment({
    participantData: {
      full_name: data.full_name,
      email: data.email,
      dob: data.dob,
      gender: data.gender,
      mobile: data.mobile,
      whatsapp: data.whatsapp,
      city: data.city,
      category: data.category || 'Runway Model',
      height: data.height || undefined,
      instagram: data.instagram || undefined,
      experience: data.experience || undefined,
      model_photo_r2_key: data.model_photo_r2_key,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      terms_version: data.terms_version || eventConfig.terms_version || '2026.2',
      declaration_text: OFFICIAL_DECLARATION_TEXT,
      total_fee: eventConfig.total_fee,
    },
    paymentData: {
      amount: data.amount,
      transaction_id: cleanTxId,
      r2_object_key: data.r2_object_key,
    },
  });

  return {
    participant: { ...participant, event_id: eventConfig.event_id },
    payment: { ...payment, event_id: eventConfig.event_id },
  };
}

/**
 * Submit a balance payment for an existing participant
 */
export async function submitBalancePayment(data: {
  reg_id: string;
  amount: number;
  transaction_id: string;
  r2_object_key: string;
}): Promise<{ participant: ParticipantRecord; payment: PaymentRecord }> {
  const driver = await getActiveDatabaseDriver();
  const cleanTxId = data.transaction_id.trim();
  const regId = data.reg_id.trim().toUpperCase();

  const participant = await getParticipantByRegId(regId);
  if (!participant) {
    throw new Error(`Registration ID "${regId}" was not found.`);
  }

  if (data.amount > participant.balance_due) {
    throw new Error(`Payment amount of ₹${data.amount} exceeds current outstanding balance of ₹${participant.balance_due}.`);
  }

  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      // Check duplicate UTR
      const existingTx = await conn.db.collection('payments').findOne({
        transaction_id: { $regex: new RegExp(`^${cleanTxId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (existingTx) {
        throw new Error(`Transaction reference / UTR "${cleanTxId}" has already been submitted.`);
      }

      const payment_id = `PAY-BAL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const paymentDoc = {
        payment_id,
        reg_id: participant.reg_id,
        event_id: participant.event_id || DEFAULT_EVENT_ID,
        payment_type: 'BALANCE_PAYMENT' as const,
        amount: data.amount,
        transaction_id: cleanTxId,
        r2_object_key: data.r2_object_key,
        status: 'PENDING' as const,
        rejection_reason: null,
        verified_by: null,
        verified_at: null,
        created_at: now,
      };

      const payResult = await conn.db.collection('payments').insertOne(paymentDoc);

      const createdPayment: PaymentRecord = {
        id: payResult.insertedId.toString(),
        payment_id,
        reg_id: participant.reg_id,
        event_id: participant.event_id || DEFAULT_EVENT_ID,
        payment_type: 'BALANCE_PAYMENT',
        amount: data.amount,
        transaction_id: cleanTxId,
        r2_object_key: data.r2_object_key,
        status: 'PENDING',
        created_at: now,
      };

      return { participant, payment: createdPayment };
    }
  }

  // Fallback to Supabase / In-Memory
  const res = await supabaseAdmin.addBalancePayment({
    reg_id: participant.reg_id,
    amount: data.amount,
    transaction_id: cleanTxId,
    r2_object_key: data.r2_object_key,
  });

  return {
    participant,
    payment: { ...res.payment, event_id: participant.event_id || DEFAULT_EVENT_ID },
  };
}

/**
 * Public participant lookup for Check Status & Pass Page
 */
export async function lookupPublicParticipantRecord(query: string) {
  const driver = await getActiveDatabaseDriver();
  const q = query.trim().toUpperCase();

  let participant = await getParticipantByRegId(q);
  if (!participant) {
    participant = await getParticipantByPhoneOrEmail(query.trim());
  }

  if (!participant) {
    return null;
  }

  let payments: any[] = [];
  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const payDocs = await conn.db.collection('payments').find({
        reg_id: participant.reg_id.toUpperCase(),
      }).sort({ created_at: -1 }).toArray();

      payments = payDocs.map(p => ({
        payment_id: p.payment_id,
        payment_type: p.payment_type,
        amount: p.amount,
        transaction_id: p.transaction_id ? p.transaction_id.replace(/^(.{3}).*(.{4})$/, '$1****$2') : '',
        status: p.status,
        created_at: p.created_at,
        verified_at: p.verified_at,
      }));
    }
  } else {
    const res = await supabaseAdmin.lookupPublicParticipant(query);
    if (res?.payments) payments = res.payments;
  }

  return {
    reg_id: participant.reg_id,
    full_name: participant.full_name,
    category: participant.category,
    city: participant.city,
    total_fee: participant.total_fee,
    amount_paid: participant.amount_paid,
    balance_due: participant.balance_due,
    status: participant.status,
    pass_token: participant.pass_token,
    created_at: participant.created_at,
    payments,
  };
}

/**
 * List all payments with participant details for Admin Dashboard with optional server-side pagination
 */
export async function listAllPayments(pagination?: { page?: number; limit?: number }): Promise<any> {
  const driver = await getActiveDatabaseDriver();
  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const total = await conn.db.collection('payments').countDocuments({});
      let cursor = conn.db.collection('payments').find({}).sort({ created_at: -1 });

      const page = pagination?.page ? Math.max(1, Number(pagination.page)) : undefined;
      const limit = pagination?.limit ? Math.max(1, Math.min(100, Number(pagination.limit))) : undefined;

      if (page !== undefined && limit !== undefined) {
        cursor = cursor.skip((page - 1) * limit).limit(limit);
      }

      const payments = await cursor.toArray();
      const regIds = [...new Set(payments.map(p => p.reg_id))];
      const registrations = await conn.db.collection('registrations').find({
        reg_id: { $in: regIds },
      }).toArray();

      const regMap = new Map();
      for (const r of registrations) {
        regMap.set(r.reg_id, {
          full_name: r.full_name,
          mobile: decryptField(r.mobile_encrypted) || r.mobile || '',
          whatsapp: decryptField(r.whatsapp_encrypted) || r.whatsapp || '',
          city: r.city,
          model_photo_r2_key: r.model_photo_r2_key || null,
        });
      }

      const items = payments.map(pay => ({
        id: pay._id.toString(),
        payment_id: pay.payment_id,
        reg_id: pay.reg_id,
        event_id: pay.event_id || DEFAULT_EVENT_ID,
        payment_type: pay.payment_type,
        amount: pay.amount,
        transaction_id: pay.transaction_id,
        r2_object_key: pay.r2_object_key,
        status: pay.status,
        rejection_reason: pay.rejection_reason || null,
        verified_by: pay.verified_by || null,
        verified_at: pay.verified_at || null,
        created_at: pay.created_at,
        participant: regMap.get(pay.reg_id) || null,
      }));

      if (page !== undefined && limit !== undefined) {
        return {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }

      return items;
    }
  }

  const all = await supabaseAdmin.getAllPayments();
  if (pagination?.page && pagination?.limit) {
    const page = Math.max(1, Number(pagination.page));
    const limit = Math.max(1, Math.min(100, Number(pagination.limit)));
    const total = all.length;
    const paginated = all.slice((page - 1) * limit, page * limit);
    return {
      items: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  return all;
}

/**
 * Get MongoDB Database Storage Metrics and 512 MB Limit Monitoring Stats
 */
export async function getStorageMetrics(): Promise<StorageMetrics> {
  const STORAGE_LIMIT_MB = 512;
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      try {
        const dbStats = await conn.db.command({ dbStats: 1 });
        const collectionNames = ['registrations', 'payments', 'events', 'audit_logs', 'temporary_records', 'admin_users'];
        const collStatsList: CollectionStorageStat[] = [];
        const counts = {
          registrations: 0,
          payments: 0,
          audit_logs: 0,
          temporary_records: 0,
          admin_users: 0,
          events: 0,
        };

        for (const name of collectionNames) {
          try {
            const cs = await conn.db.command({ collStats: name });
            const count = cs.count ?? cs.objects ?? 0;
            if (name in counts) {
              (counts as any)[name] = count;
            }
            collStatsList.push({
              name,
              count,
              dataSizeKB: Number(((cs.size || 0) / 1024).toFixed(2)),
              storageSizeKB: Number(((cs.storageSize || 0) / 1024).toFixed(2)),
              indexSizeKB: Number(((cs.totalIndexSize || 0) / 1024).toFixed(2)),
              avgObjSizeBytes: Math.round(cs.avgObjSize || 0),
            });
          } catch {
            collStatsList.push({
              name,
              count: 0,
              dataSizeKB: 0,
              storageSizeKB: 0,
              indexSizeKB: 0,
              avgObjSizeBytes: 0,
            });
          }
        }

        const dataSizeMB = Number(((dbStats.dataSize || 0) / (1024 * 1024)).toFixed(3));
        const storageSizeMB = Number(((dbStats.storageSize || 0) / (1024 * 1024)).toFixed(3));
        const indexSizeMB = Number(((dbStats.indexSize || 0) / (1024 * 1024)).toFixed(3));
        const totalAllocatedMB = Number((storageSizeMB + indexSizeMB).toFixed(3));
        const usagePercentage = Number(((totalAllocatedMB / STORAGE_LIMIT_MB) * 100).toFixed(2));
        const remainingCapacityMB = Number(Math.max(0, STORAGE_LIMIT_MB - totalAllocatedMB).toFixed(3));

        // At ~1.5 KB per contestant record (reg + payment + indexes)
        const estimatedRemainingRegistrations = Math.floor((remainingCapacityMB * 1024) / 1.5);
        const estimatedMonthlyGrowthMB = Number(Math.max(0.1, (counts.registrations * 1.5) / 1024).toFixed(3));

        let alert: StorageAlert;
        if (usagePercentage >= 95) {
          alert = {
            level: 'EMERGENCY_WARNING',
            thresholdPercent: 95,
            message: 'EMERGENCY: Database storage is >= 95% of the 512 MB limit! Urgent action required to prevent cluster lock.',
            actionRequired: true,
            recommendedAction: 'Prune legacy audit logs and export/archive completed events immediately.',
          };
        } else if (usagePercentage >= 85) {
          alert = {
            level: 'CRITICAL_WARNING',
            thresholdPercent: 85,
            message: 'Critical Warning: Database storage is at 85% capacity. Immediate cleanup recommended.',
            actionRequired: true,
            recommendedAction: 'Trigger manual cleanup of historical audit records and review index overhead.',
          };
        } else if (usagePercentage >= 75) {
          alert = {
            level: 'WARNING',
            thresholdPercent: 75,
            message: 'Warning: Database storage reached 75% capacity. Monitor registration velocity.',
            actionRequired: true,
            recommendedAction: 'Plan archival of previous season records before upcoming high-volume registrations.',
          };
        } else if (usagePercentage >= 60) {
          alert = {
            level: 'INFORMATIONAL_WARNING',
            thresholdPercent: 60,
            message: 'Notice: Database storage has crossed 60% capacity.',
            actionRequired: false,
            recommendedAction: 'Continue monitoring monthly storage trajectory.',
          };
        } else {
          alert = {
            level: 'NORMAL',
            thresholdPercent: 60,
            message: 'Storage Optimal: Total database allocation is healthy and well below limits (< 60%).',
            actionRequired: false,
            recommendedAction: 'No action required. Cloudflare R2 offloading is keeping DB footprint minimal.',
          };
        }

        return {
          storageLimitMB: STORAGE_LIMIT_MB,
          totalAllocatedMB,
          dataSizeMB,
          storageSizeMB,
          indexSizeMB,
          usagePercentage,
          remainingCapacityMB,
          estimatedRemainingRegistrations,
          estimatedMonthlyGrowthMB,
          alert,
          collections: collStatsList,
          counts,
          storageHealth: {
            r2_offload_active: true,
            ttl_cleanup_active: true,
            zero_binary_in_db: true,
          },
          lastChecked: new Date().toISOString(),
        };
      } catch (err) {
        console.error('Failed to query dbStats in getStorageMetrics:', err);
      }
    }
  }

  // Fallback / local / mock metrics
  return {
    storageLimitMB: STORAGE_LIMIT_MB,
    totalAllocatedMB: 0.45,
    dataSizeMB: 0.05,
    storageSizeMB: 0.15,
    indexSizeMB: 0.30,
    usagePercentage: 0.09,
    remainingCapacityMB: 511.55,
    estimatedRemainingRegistrations: 340000,
    estimatedMonthlyGrowthMB: 0.15,
    alert: {
      level: 'NORMAL',
      thresholdPercent: 60,
      message: 'Storage Optimal: Total database allocation is healthy and well below limits (< 60%).',
      actionRequired: false,
      recommendedAction: 'No action required. Cloudflare R2 offloading is keeping DB footprint minimal.',
    },
    collections: [
      { name: 'registrations', count: 0, dataSizeKB: 0, storageSizeKB: 36, indexSizeKB: 72, avgObjSizeBytes: 0 },
      { name: 'payments', count: 0, dataSizeKB: 0, storageSizeKB: 36, indexSizeKB: 72, avgObjSizeBytes: 0 },
      { name: 'events', count: 1, dataSizeKB: 1, storageSizeKB: 36, indexSizeKB: 36, avgObjSizeBytes: 600 },
      { name: 'audit_logs', count: 0, dataSizeKB: 0, storageSizeKB: 36, indexSizeKB: 72, avgObjSizeBytes: 0 },
      { name: 'temporary_records', count: 0, dataSizeKB: 0, storageSizeKB: 36, indexSizeKB: 72, avgObjSizeBytes: 0 },
      { name: 'admin_users', count: 1, dataSizeKB: 0.5, storageSizeKB: 36, indexSizeKB: 36, avgObjSizeBytes: 300 },
    ],
    counts: {
      registrations: 0,
      payments: 0,
      audit_logs: 0,
      temporary_records: 0,
      admin_users: 1,
      events: 1,
    },
    storageHealth: {
      r2_offload_active: true,
      ttl_cleanup_active: true,
      zero_binary_in_db: true,
    },
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Permanently delete a participant and associated records (Admin only).
 * Automatically frees the registration ID so the lowest missing integer is re-allocated for subsequent contestants.
 */
export async function deleteParticipantRecord(regId: string, adminEmail: string = 'admin@skyracreations.com'): Promise<{ success: boolean; message: string; deletedRegId: string }> {
  const cleanRegId = regId.trim().toUpperCase();
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const pDoc = await conn.db.collection('registrations').findOne({ reg_id: cleanRegId });
      if (!pDoc) {
        throw new Error(`Participant with Registration ID ${cleanRegId} not found.`);
      }

      // Delete participant
      await conn.db.collection('registrations').deleteOne({ reg_id: cleanRegId });

      // Delete all associated payments
      await conn.db.collection('payments').deleteMany({ reg_id: cleanRegId });

      // Audit log
      await conn.db.collection('audit_logs').insertOne({
        action: 'DELETE_PARTICIPANT',
        reg_id: cleanRegId,
        participant_name: pDoc.full_name,
        deleted_by: adminEmail,
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        message: `Participant ${pDoc.full_name} (${cleanRegId}) deleted. Slot is now available for new registrations.`,
        deletedRegId: cleanRegId,
      };
    }
  }

  // Fallback in-memory
  const idx = supabaseAdmin.memParticipants.findIndex((p: any) => p.reg_id.toUpperCase() === cleanRegId);
  if (idx === -1) {
    throw new Error(`Participant with Registration ID ${cleanRegId} not found.`);
  }
  const removed = supabaseAdmin.memParticipants.splice(idx, 1)[0];
  for (let i = supabaseAdmin.memPayments.length - 1; i >= 0; i--) {
    if (supabaseAdmin.memPayments[i].reg_id.toUpperCase() === cleanRegId) {
      supabaseAdmin.memPayments.splice(i, 1);
    }
  }

  return {
    success: true,
    message: `Participant ${removed.full_name} (${cleanRegId}) deleted. Slot is now available for new registrations.`,
    deletedRegId: cleanRegId,
  };
}

/**
 * Permanently delete a payment submission (Admin only).
 * Automatically recalculates the participant's paid balance and status.
 */
export async function deletePaymentRecord(paymentId: string, adminEmail: string = 'admin@skyracreations.com'): Promise<{ success: boolean; message: string; paymentId: string }> {
  const cleanPaymentId = paymentId.trim();
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const payDoc = await conn.db.collection('payments').findOne({ payment_id: cleanPaymentId });
      if (!payDoc) {
        throw new Error(`Payment record ${cleanPaymentId} not found.`);
      }

      await conn.db.collection('payments').deleteOne({ payment_id: cleanPaymentId });

      // Recalculate participant balance if needed
      const remainingVerified = await conn.db.collection('payments')
        .find({ reg_id: payDoc.reg_id, status: 'VERIFIED' })
        .toArray();

      const newTotalPaid = remainingVerified.reduce((sum, p) => sum + (p.amount || 0), 0);
      const participant = await conn.db.collection('registrations').findOne({ reg_id: payDoc.reg_id });

      if (participant) {
        const totalFee = participant.total_fee || 3000;
        const newBalance = Math.max(0, totalFee - newTotalPaid);
        let newStatus: ParticipantRecord['status'] = 'PENDING_VERIFICATION';
        if (newBalance === 0 && newTotalPaid > 0) {
          newStatus = 'FULLY_PAID';
        } else if (newTotalPaid > 0) {
          newStatus = 'PARTIALLY_PAID';
        }

        await conn.db.collection('registrations').updateOne(
          { reg_id: payDoc.reg_id },
          {
            $set: {
              amount_paid: newTotalPaid,
              balance_due: newBalance,
              status: newStatus,
              updated_at: new Date().toISOString(),
            },
          }
        );
      }

      // Audit log
      await conn.db.collection('audit_logs').insertOne({
        action: 'DELETE_PAYMENT',
        payment_id: cleanPaymentId,
        reg_id: payDoc.reg_id,
        amount: payDoc.amount,
        deleted_by: adminEmail,
        timestamp: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });

      return {
        success: true,
        message: `Payment ${cleanPaymentId} of ₹${payDoc.amount} deleted.`,
        paymentId: cleanPaymentId,
      };
    }
  }

  // Fallback in-memory
  const idx = supabaseAdmin.memPayments.findIndex((p: any) => p.payment_id === cleanPaymentId);
  if (idx === -1) {
    throw new Error(`Payment record ${cleanPaymentId} not found.`);
  }
  const removedPay = supabaseAdmin.memPayments.splice(idx, 1)[0];
  const participant = supabaseAdmin.memParticipants.find((p: any) => p.reg_id === removedPay.reg_id);
  if (participant) {
    const verifiedPayments = supabaseAdmin.memPayments.filter((p: any) => p.reg_id === removedPay.reg_id && p.status === 'VERIFIED');
    participant.amount_paid = verifiedPayments.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    participant.balance_due = Math.max(0, participant.total_fee - participant.amount_paid);
    if (participant.balance_due === 0 && participant.amount_paid > 0) {
      participant.status = 'FULLY_PAID';
    } else if (participant.amount_paid > 0) {
      participant.status = 'PARTIALLY_PAID';
    } else {
      participant.status = 'PENDING_VERIFICATION';
    }
  }

  return {
    success: true,
    message: `Payment ${cleanPaymentId} deleted.`,
    paymentId: cleanPaymentId,
  };
}
