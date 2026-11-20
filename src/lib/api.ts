import { Participant, Payment, PaymentInfo, AdminStats } from '../types/index';

const ADMIN_TOKEN_KEY = 'skyra_admin_session_token';

export function getAdminToken(): string | null {
  return typeof window !== 'undefined' ? sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) : null;
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options?.headers);

  if (url.includes('/api/admin') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function adminLogin(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
  const data = await fetchJson<{ success: boolean; token: string; user: any }>('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (data?.token) {
    setAdminToken(data.token);
  }
  return data;
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

export async function getAdminParticipants(): Promise<Participant[]> {
  return fetchJson<Participant[]>('/api/admin/participants');
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
  const token = getAdminToken();
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  if (keys && keys.length > 0) {
    return `/api/admin/download-zip?keys=${encodeURIComponent(keys.join(','))}${tokenParam}`;
  }
  return `/api/admin/download-zip?${tokenParam.replace('&', '')}`;
}

export function getCsvExportUrl(): string {
  const token = getAdminToken();
  return token ? `/api/admin/export?token=${encodeURIComponent(token)}` : '/api/admin/export';
}
