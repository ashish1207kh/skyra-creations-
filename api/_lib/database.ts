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
  created_at: string;
  updated_at: string;
}

const DEFAULT_EVENT_ID = 'EVT-CHX-2026';

/**
 * Checks which database provider is currently active
 */
export async function getActiveDatabaseDriver(): Promise<'mongodb' | 'supabase' | 'in-memory'> {
  if (process.env.MONGODB_URI) {
    const conn = await getMongoConnection();
    if (conn) return 'mongodb';
  }
  if (supabaseAdmin.isSupabaseConfigured) {
    return 'supabase';
  }
  return 'in-memory';
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
  regId: string,
  newStatus: 'VERIFIED' | 'REJECTED',
  verifiedBy: string,
  rejectionReason?: string
): Promise<{ success: boolean; participant?: ParticipantRecord }> {
  const driver = await getActiveDatabaseDriver();
  const now = new Date().toISOString();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      await conn.db.collection('payments').updateOne(
        { $or: [{ payment_id: paymentId }, { _id: paymentId as any }] },
        {
          $set: {
            status: newStatus,
            verified_by: verifiedBy,
            verified_at: now,
            rejection_reason: rejectionReason || null,
          },
        }
      );

      // If verified, update participant balance & status
      if (newStatus === 'VERIFIED') {
        const participant = await getParticipantByRegId(regId);
        if (participant) {
          const passToken = supabaseAdmin.generatePassToken(regId);
          const newAmountPaid = participant.total_fee;
          const newStatus = 'FULLY_PAID';

          await conn.db.collection('registrations').updateOne(
            { reg_id: regId.toUpperCase() },
            {
              $set: {
                amount_paid: newAmountPaid,
                balance_due: 0,
                status: newStatus,
                pass_token: passToken,
                updated_at: now,
              },
            }
          );
        }
      }

      const updated = await getParticipantByRegId(regId);
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

/**
 * Get all registrations for admin views with optional filtering and role masking
 */
export async function listRegistrations(filter?: { status?: string; event_id?: string }, mask: boolean = false): Promise<ParticipantRecord[]> {
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

      const docs = await conn.db.collection('registrations').find(query).sort({ created_at: -1 }).toArray();

      return docs.map(doc => {
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
    }
  }

  // Fallback to Supabase
  const list = await supabaseAdmin.getAllParticipants();
  const filtered = filter?.status && filter.status !== 'ALL' ? list.filter(p => p.status === filter.status) : list;

  return filtered.map((p: any) => {
    const rec: ParticipantRecord = { ...p, event_id: DEFAULT_EVENT_ID };
    return mask ? maskPII(rec) : rec;
  });
}

/**
 * Get aggregated statistics for the admin dashboard
 */
export async function getDashboardStats(): Promise<{
  totalRegistrations: number;
  pendingVerification: number;
  partiallyPaid: number;
  fullyPaid: number;
  rejected: number;
  totalCollected: number;
  totalOutstanding: number;
}> {
  const driver = await getActiveDatabaseDriver();

  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const regs = await conn.db.collection('registrations').find({}).toArray();
      const stats = {
        totalRegistrations: regs.length,
        pendingVerification: 0,
        partiallyPaid: 0,
        fullyPaid: 0,
        rejected: 0,
        totalCollected: 0,
        totalOutstanding: 0,
      };

      for (const r of regs) {
        if (r.status === 'PENDING_VERIFICATION') stats.pendingVerification++;
        else if (r.status === 'PARTIALLY_PAID') stats.partiallyPaid++;
        else if (r.status === 'FULLY_PAID') stats.fullyPaid++;
        else if (r.status === 'REJECTED') stats.rejected++;

        stats.totalCollected += (r.amount_paid || 0);
        stats.totalOutstanding += (r.balance_due || 0);
      }

      return stats;
    }
  }

  const s = await supabaseAdmin.getDashboardStats();
  return {
    totalRegistrations: s.total_participants,
    pendingVerification: s.pending_verifications_count,
    partiallyPaid: s.partially_paid_count,
    fullyPaid: s.fully_paid_count,
    rejected: s.rejected_count,
    totalCollected: s.total_verified_revenue,
    totalOutstanding: s.total_balance_due,
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
