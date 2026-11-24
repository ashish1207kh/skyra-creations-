export type ParticipantStatus = 'PENDING_VERIFICATION' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'REJECTED';
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type PaymentType = 'INITIAL_REGISTRATION' | 'BALANCE_PAYMENT';

export interface Payment {
  id: string;
  payment_id: string;
  participant_id: string;
  reg_id: string;
  payment_type: PaymentType;
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  file_mime?: string;
  file_size?: number;
  status: PaymentStatus;
  rejection_reason?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  view_url?: string; // Signed GET URL generated for admin view
  model_photo_url?: string | null; // Signed GET URL for model portrait photograph
}

export interface Participant {
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
  model_photo_r2_key?: string | null;
  model_photo_url?: string | null; // Signed GET URL for model portrait photograph
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  terms_version?: string;
  declaration_text?: string;
  total_fee: number;
  amount_paid: number;
  balance_due: number;
  pending_amount?: number;
  effective_balance_due?: number;
  status: ParticipantStatus;
  pass_token?: string;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

export interface PaymentInfo {
  event_id?: string;
  event_name: string;
  location?: string;
  bank_name?: string;
  bank_account_ref?: string;
  associated_mobile?: string;
  upi_id: string;
  upi_name: string;
  currency?: string;
  aid?: string;
  default_total_fee: number;
  allowed_token_advances?: number[];
  allowed_balance_amounts: number[];
  terms_version?: string;
  photo_required?: boolean;
  qr_code_url: string;
}

export interface PresignedUploadResponse {
  upload_url: string;
  object_key: string;
  expires_in_seconds: number;
}

export interface AdminStats {
  total_participants: number;
  total_verified_revenue: number;
  total_pending_amount: number;
  total_balance_due: number;
  pending_verifications_count: number;
  verified_participants_count: number;
  partially_paid_count: number;
  fully_paid_count: number;
  rejected_count: number;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
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
