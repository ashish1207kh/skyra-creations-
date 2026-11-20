import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skyra_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPaymentInfo = async () => {
  const res = await api.get('/api/payment-info');
  return res.data;
};

export const registerParticipant = async (formData, onProgress) => {
  const res = await api.post('/api/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return res.data;
};

export const lookupParticipant = async (query) => {
  const res = await api.get(`/api/participant/lookup/${encodeURIComponent(query)}`);
  return res.data;
};

export const submitBalancePayment = async (formData, onProgress) => {
  const res = await api.post('/api/balance-payment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return res.data;
};

export const getParticipantPass = async (regId) => {
  const res = await api.get(`/api/participant/${encodeURIComponent(regId)}/pass`);
  return res.data;
};

export const adminLogin = async (username, password) => {
  const res = await api.post('/api/admin/login', { username, password });
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const getAdminParticipants = async (params = {}) => {
  const res = await api.get('/api/admin/participants', { params });
  return res.data;
};

export const getAdminPayments = async (params = {}) => {
  const res = await api.get('/api/admin/payments', { params });
  return res.data;
};

export const verifyPayment = async (paymentId, action, rejectionReason = '') => {
  const res = await api.post(`/api/admin/payments/${paymentId}/verify`, {
    action,
    rejection_reason: rejectionReason,
  });
  return res.data;
};

export const getExportUrl = () => '/api/admin/export';

export default api;
