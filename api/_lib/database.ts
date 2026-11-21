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
          title: doc.title || 'Runway Show 2026 — Chennai City Center',
          status: doc.status || 'ACTIVE',
          location: doc.location || 'Chennai & Selected Nearby Locations',
          event_date: doc.event_date || '2026-05-15T18:00:00Z',
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
    title: 'Runway Show 2026 — Chennai City Center',
    status: 'ACTIVE',
    location: 'Chennai & Selected Nearby Locations',
    event_date: '2026-05-15T18:00:00Z',
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

      // 3. Generate reg_id
      const count = await conn.db.collection('registrations').countDocuments();
      const reg_id = `SC-2026-${1000 + count + 1}`;
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
 * List all payments with participant details for Admin Dashboard
 */
export async function listAllPayments() {
  const driver = await getActiveDatabaseDriver();
  if (driver === 'mongodb') {
    const conn = await getMongoConnection();
    if (conn) {
      const payments = await conn.db.collection('payments').find({}).sort({ created_at: -1 }).toArray();
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

      return payments.map(pay => ({
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
    }
  }

  return supabaseAdmin.getAllPayments();
}
