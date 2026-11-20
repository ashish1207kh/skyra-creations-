import { Participant, Payment, PaymentInfo, AdminStats } from '../types/index';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getPaymentInfo(): Promise<PaymentInfo> {
  return fetchJson<PaymentInfo>('/api/payment-info');
}

export async function registerContestant(payload: {
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
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  terms_confirmed: boolean;
}): Promise<{ success: boolean; message: string; reg_id: string; participant: Participant; payment: Payment }> {
  return fetchJson('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function lookupParticipant(query: string): Promise<Participant> {
  return fetchJson<Participant>(`/api/lookup?query=${encodeURIComponent(query)}`);
}

export async function submitBalancePayment(payload: {
  reg_id: string;
  full_name: string;
  amount: number;
  transaction_id: string;
  r2_object_key: string;
  terms_confirmed: boolean;
}): Promise<{ success: boolean; message: string; reg_id: string; payment_id: string; amount: number }> {
  return fetchJson('/api/balance-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  return fetchJson<AdminStats>('/api/admin/stats');
}

export async function getAdminParticipants(): Promise<{ items: Participant[]; total: number }> {
  return fetchJson('/api/admin/participants');
}

export async function getAdminPayments(): Promise<Payment[]> {
  return fetchJson<Payment[]>('/api/admin/payments');
}

export async function verifyPayment(
  paymentId: string,
  action: 'VERIFY' | 'REJECT',
  reason?: string
): Promise<{ success: boolean; message: string }> {
  return fetchJson('/api/admin/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payment_id: paymentId,
      action,
      rejection_reason: reason,
    }),
  });
}

export function getZipDownloadUrl(keys?: string[]): string {
  if (keys && keys.length > 0) {
    return `/api/admin/download-zip?keys=${encodeURIComponent(keys.join(','))}`;
  }
  return '/api/admin/download-zip';
}

export function getCsvExportUrl(): string {
  return '/api/admin/export';
}
