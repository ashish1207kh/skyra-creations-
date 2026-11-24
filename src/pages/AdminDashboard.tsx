import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Users, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Search, 
  Filter, 
  MessageSquare, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Sparkles,
  Calculator,
  FileText,
  X, 
  RefreshCw, 
  FolderArchive,
  AlertCircle,
  Database,
  HardDrive,
  Server,
  Activity,
  AlertTriangle,
  Info,
  User,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { 
  getAdminStats, 
  getAdminParticipants, 
  getAdminPayments, 
  verifyPayment, 
  getCsvExportUrl, 
  getZipDownloadUrl,
  adminLogin,
  getAdminToken,
  clearAdminToken,
  getStorageMetrics,
  deleteAdminParticipant,
  deleteAdminPayment,
  purgeAdminDatabaseData
} from '../lib/api';
import { AdminStats, Participant, Payment, StorageMetrics } from '../types/index';
import HumanVerificationCaptcha from '../components/HumanVerificationCaptcha';

interface ActiveMediaDetails {
  url: string;
  title: string;
  subtitle?: string;
  type: 'photo' | 'receipt';
  payment?: Payment;
  participant?: Participant;
  details?: {
    regId?: string;
    name?: string;
    amount?: number;
    transactionId?: string;
    paymentType?: string;
    date?: string;
    category?: string;
    city?: string;
    contact?: string;
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAdminToken()));

  // Login form state (no hardcoded passwords)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'queue' | 'participants' | 'storage'>('queue');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Enhanced Lightbox & Inspection State
  const [activeMedia, setActiveMedia] = useState<ActiveMediaDetails | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Participant Detail Dossier Modal
  const [viewParticipantModal, setViewParticipantModal] = useState<Participant | null>(null);

  // Participant Registry & Queue Filters
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [participantStatusFilter, setParticipantStatusFilter] = useState('ALL');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');

  // Copy feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
  const [deleteParticipantModal, setDeleteParticipantModal] = useState<Participant | null>(null);
  const [deletePaymentModal, setDeletePaymentModal] = useState<Payment | null>(null);
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccessMsg, setPurgeSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedReasonOption, setSelectedReasonOption] = useState('Invalid transaction reference');
  const [customReason, setCustomReason] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const predefinedRejectionReasons = [
    'Invalid transaction reference',
    'Amount mismatch',
    'Payment not received',
    'Duplicate transaction',
    'Unclear payment proof',
    'Other',
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboardData(false);

    // Auto-refresh: automatically reflects new registrations and payments every 6 seconds
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 6000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) {
      setLoginError('Please complete the security challenge below to sign in.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');

    try {
      await adminLogin(email, password);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setStats(null);
    setPayments([]);
    setParticipants([]);
    setStorageMetrics(null);
  };

  const loadDashboardData = async (silent: boolean = false) => {
    if (!silent) setLoadingData(true);
    setIsSyncing(true);
    try {
      const [statsData, paymentsData, participantsData, storageData] = await Promise.all([
        getAdminStats(),
        getAdminPayments(),
        getAdminParticipants(),
        getStorageMetrics().catch(() => null),
      ]);
      setStats(statsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : (paymentsData as any)?.items || []);
      setParticipants(Array.isArray(participantsData) ? participantsData : (participantsData as any)?.items || []);
      if (storageData) {
        setStorageMetrics(storageData);
      }
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        handleLogout();
      } else {
        console.error('Failed to load admin data:', err);
      }
    } finally {
      if (!silent) setLoadingData(false);
      setIsSyncing(false);
    }
  };

  const handleDeleteParticipant = async (regId: string) => {
    setDeletingId(regId);
    try {
      const res = await deleteAdminParticipant(regId);
      setDeleteParticipantModal(null);
      await loadDashboardData(true);
      alert(res.message || `Participant ${regId} deleted successfully.`);
    } catch (err: any) {
      alert(`Failed to delete participant: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setDeletingId(paymentId);
    try {
      const res = await deleteAdminPayment(paymentId);
      setDeletePaymentModal(null);
      await loadDashboardData(true);
      alert(res.message || `Payment ${paymentId} deleted successfully.`);
    } catch (err: any) {
      alert(`Failed to delete payment: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerify = async (paymentId: string, action: 'VERIFY' | 'REJECT', reason?: string) => {
    setVerifyingId(paymentId);
    try {
      await verifyPayment(paymentId, action, reason);
      setRejectModalPayment(null);
      setCustomReason('');
      await loadDashboardData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handlePurgeAllData = async () => {
    setPurging(true);
    try {
      const res = await purgeAdminDatabaseData();
      setPurgeModalOpen(false);
      setPurgeSuccessMsg(res.message || 'All temporary records and test data deleted successfully. Starting with zero storage.');
      await loadDashboardData(false);
      setTimeout(() => setPurgeSuccessMsg(''), 7000);
    } catch (err: any) {
      alert('Failed to purge data: ' + (err.message || 'Unknown error'));
    } finally {
      setPurging(false);
    }
  };

  const handleViewPhoto = async (photoKey?: string | null, candidateName?: string, regId?: string, category?: string) => {
    if (!photoKey) {
      alert('No model photograph uploaded for this participant.');
      return;
    }
    try {
      const res = await fetch(`/api/storage/presigned-view?key=${encodeURIComponent(photoKey)}`);
      const data = await res.json();
      if (data.view_url) {
        setZoomLevel(1);
        setRotation(0);
        setActiveMedia({
          url: data.view_url,
          title: candidateName || 'Model Portrait Photograph',
          subtitle: `Registration ID: ${regId || ''}${category ? ` • Category: ${category}` : ''}`,
          type: 'photo',
          details: { regId, name: candidateName, category },
        });
      } else {
        alert('Could not generate view URL.');
      }
    } catch (err: any) {
      alert('Failed to load model photograph: ' + err.message);
    }
  };

  const handleViewCandidatePhoto = (photoUrl: string, candidateName: string, regId: string, category?: string) => {
    setZoomLevel(1);
    setRotation(0);
    setActiveMedia({
      url: photoUrl,
      title: `Model Photograph: ${candidateName}`,
      subtitle: `${regId}${category ? ` • Category: ${category}` : ''}`,
      type: 'photo',
      details: { regId, name: candidateName, category },
    });
  };

  const handleViewReceipt = (pay: Payment) => {
    const participantName = (pay as any).participant?.full_name || 'Participant';
    setZoomLevel(1);
    setRotation(0);
    setActiveMedia({
      url: pay.view_url || '/qr_code.png',
      title: `Payment Receipt: ₹${pay.amount?.toLocaleString('en-IN')}`,
      subtitle: `${participantName} • ${pay.reg_id}`,
      type: 'receipt',
      payment: pay,
      details: {
        regId: pay.reg_id,
        name: participantName,
        amount: pay.amount,
        transactionId: pay.transaction_id,
        paymentType: pay.payment_type,
        date: pay.created_at,
      },
    });
  };

  // WhatsApp manual outreach trigger
  const openWhatsApp = (phone: string, name: string, regId: string, status: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let message = '';
    
    if (status === 'PENDING' || status === 'PENDING_VERIFICATION') {
      message = encodeURIComponent(
        `Hello ${name},\n\nYour payment submission for SKYRA CREATIONS Runway Show 2026 is currently under review.\nRegistration ID: ${regId}\n\nWe will update you once the verification process is complete.`
      );
    } else {
      message = encodeURIComponent(
        `Hello ${name},\n\nYour SKYRA CREATIONS Runway Show 2026 registration has been reviewed.\nRegistration ID: ${regId}\nStatus: ${status}\n\nThank you for choosing SKYRA CREATIONS. Please keep your registration ID for future communication.`
      );
    }

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // If not logged in, render Admin Login Card
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-[#12141a] border border-white/10 rounded-sm p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />
          <div className="relative mx-auto mb-5 group select-none flex justify-center">
            <div className="relative px-5 py-3 rounded-sm bg-black/80 border border-white/15 shadow-2xl">
              <img src="/logo-clean.png" alt="Skyra Creations Logo" className="h-14 sm:h-16 w-auto object-contain" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
            SKYRA CREATIONS — ADMINISTRATION
          </h2>
          <p className="text-xs text-zinc-400 text-center mb-6 font-light">
            Registration, payment verification and event management.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-sm text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono-editorial text-[10px] uppercase text-[#BFC3C7]">Administrator Username / Email</label>
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className="font-mono-editorial text-[9px] text-zinc-400 hover:text-[#C6FF00] inline-flex items-center space-x-1 transition-colors"
                  tabIndex={-1}
                >
                  {showEmail ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showEmail ? 'HIDE' : 'SHOW'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showEmail ? 'text' : 'password'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 pr-11 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C6FF00] tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowEmail(!showEmail)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C6FF00] transition-colors p-1"
                  title={showEmail ? 'Hide username while inserting' : 'Reveal username'}
                  tabIndex={-1}
                >
                  {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono-editorial text-[10px] uppercase text-[#BFC3C7]">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="font-mono-editorial text-[9px] text-zinc-400 hover:text-[#C6FF00] inline-flex items-center space-x-1 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 pr-11 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C6FF00] tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C6FF00] transition-colors p-1"
                  title={showPassword ? 'Hide password while inserting' : 'Reveal password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Verification */}
            <HumanVerificationCaptcha 
              label="ADMIN IDENTITY VERIFICATION"
              onVerified={(v) => {
                setIsCaptchaVerified(v);
                setLoginError('');
              }}
            />

            <button
              type="submit"
              disabled={loginLoading || !isCaptchaVerified}
              className="w-full py-3.5 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'AUTHENTICATING...' : 'SIGN IN TO OPERATIONS DESK'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="font-mono-editorial text-[10px] text-zinc-500">
              Authorized personnel only. All access is cryptographically audited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real-time mathematically verified calculations
  const calculatedTotalParticipants = participants.length;
  const verifiedPayments = payments.filter((p) => p.status === 'VERIFIED');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const rejectedPayments = payments.filter((p) => p.status === 'REJECTED');

  const calculatedVerifiedRevenue = verifiedPayments.reduce(
    (acc, p) => acc + (typeof p.amount === 'number' ? p.amount : 0),
    0
  );
  const calculatedPendingAmount = pendingPayments.reduce(
    (acc, p) => acc + (typeof p.amount === 'number' ? p.amount : 0),
    0
  );
  const calculatedPendingCount = pendingPayments.length;

  const calculatedContractedFee = participants.reduce(
    (acc, p) => acc + (typeof p.total_fee === 'number' ? p.total_fee : 3000),
    0
  );
  const calculatedTotalOutstanding = participants.reduce((acc, p) => {
    const fee = typeof p.total_fee === 'number' ? p.total_fee : 3000;
    const paid = typeof p.amount_paid === 'number' ? p.amount_paid : 0;
    return acc + Math.max(0, fee - paid);
  }, 0);

  const calculatedFullyPaidCount = participants.filter(
    (p) => p.status === 'FULLY_PAID' || (p.amount_paid >= p.total_fee && p.amount_paid > 0)
  ).length;
  const calculatedPartiallyPaidCount = participants.filter(
    (p) => p.status === 'PARTIALLY_PAID' || (p.amount_paid > 0 && p.amount_paid < p.total_fee)
  ).length;

  // Active verified stats
  const displayTotalParticipants = stats?.total_participants ?? calculatedTotalParticipants;
  const displayVerifiedRevenue = stats?.total_verified_revenue ?? calculatedVerifiedRevenue;
  const displayPendingAmount = (stats?.total_pending_amount && stats.total_pending_amount > 0)
    ? stats.total_pending_amount
    : calculatedPendingAmount;
  const displayPendingCount = (stats?.pending_verifications_count && stats.pending_verifications_count > 0)
    ? stats.pending_verifications_count
    : calculatedPendingCount;
  const displayTotalOutstanding = stats?.total_balance_due ?? calculatedTotalOutstanding;
  const displayFullyPaidCount = stats?.fully_paid_count ?? calculatedFullyPaidCount;
  const displayPartiallyPaidCount = stats?.partially_paid_count ?? calculatedPartiallyPaidCount;

  // Mathematical Audit Equation: Expected Total Contract Value = Verified Revenue + Outstanding Balance Due
  const isEquationBalanced = calculatedContractedFee === (displayVerifiedRevenue + displayTotalOutstanding);

  // Filtered Payments for Queue
  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const participantName = ((p as any).participant?.full_name || '').toLowerCase();
    const matchesSearch = !q || 
      p.reg_id.toLowerCase().includes(q) ||
      p.transaction_id.toLowerCase().includes(q) ||
      participantName.includes(q);
    
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPaymentType = paymentTypeFilter === 'ALL' || p.payment_type === paymentTypeFilter;
    return matchesSearch && matchesStatus && matchesPaymentType;
  });

  // Filtered Participants for Registry
  const filteredParticipants = participants
    .filter((p) => {
      const q = participantSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.reg_id.toLowerCase().includes(q) ||
        p.full_name.toLowerCase().includes(q) ||
        (p.mobile || '').toLowerCase().includes(q) ||
        (p.whatsapp || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesStatus = participantStatusFilter === 'ALL' || p.status === participantStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const numA = parseInt(a.reg_id.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.reg_id.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });

  const CATEGORY_FILTER_OPTIONS = [
    'ALL',
    'Male above 18',
    'Female above 18',
    'Other above 18',
    'Kids below 18',
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 6. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative px-3 py-1.5 rounded-sm bg-black/80 border border-white/15 shadow-lg shrink-0 select-none">
            <img src="/logo-clean.png" alt="Skyra Creations Logo" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00] animate-pulse" />
              <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#C6FF00] font-bold">OPERATIONS DESK</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
              SKYRA CREATIONS — ADMINISTRATION
            </h1>
            <p className="text-xs text-zinc-400 font-light">Registration, payment verification and event management.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono-editorial">
          {/* Live Sync Status Pill */}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-sm bg-black/60 border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 text-[10px] tracking-wide">
              LIVE AUTO-SYNC {lastSyncedAt && <span className="text-zinc-500 font-mono">({lastSyncedAt})</span>}
            </span>
          </div>

          <button
            onClick={() => loadDashboardData(false)}
            disabled={loadingData || isSyncing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-sm bg-white/5 hover:bg-white/10 text-white rounded-sm text-xs transition-colors border border-white/10 disabled:opacity-50"
            title="Refresh All Records Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#C6FF00]' : ''}`} />
            <span>SYNC</span>
          </button>

          {/* 6.4 Admin Exports */}
          <a
            href={getCsvExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/15 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>EXPORT CSV</span>
          </a>

          <a
            href={getZipDownloadUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-sm bg-[#C6FF00]/10 hover:bg-[#C6FF00]/20 text-[#C6FF00] border border-[#C6FF00]/30 text-xs font-semibold transition-colors"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>DOWNLOAD PHOTOS (ZIP)</span>
          </a>

          <button
            onClick={() => setPurgeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-sm bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
            title="Purge Temporary Data & Reset to Zero Storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>RESET STORAGE (0 KB)</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-sm bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Purge Success Alert */}
      {purgeSuccessMsg && (
        <div className="mb-6 p-4 rounded-sm bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{purgeSuccessMsg}</span>
          </div>
          <button onClick={() => setPurgeSuccessMsg('')} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6.1 METRICS CARDS WITH MATHEMATICAL INTEGRITY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Participants Registered */}
        <div className="bg-[#12141a] border border-white/10 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400">Total Participants</span>
            <div className="w-8 h-8 rounded-sm bg-white/5 text-white flex items-center justify-center border border-white/10">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{displayTotalParticipants}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">
            {displayFullyPaidCount} Fully Paid • {displayPartiallyPaidCount} Partial
          </div>
        </div>

        {/* Card 2: Total Verified Revenue */}
        <div className="bg-[#12141a] border border-emerald-500/30 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-emerald-400">Verified Revenue</span>
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">₹{displayVerifiedRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Bank Confirmed &amp; Verified</div>
        </div>

        {/* Card 3: Total Pending Verification Amount */}
        <div className="bg-[#12141a] border border-[#C6FF00]/30 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#C6FF00]">Pending Verification</span>
            <div className="w-8 h-8 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] flex items-center justify-center border border-[#C6FF00]/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#C6FF00]">₹{displayPendingAmount.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">{displayPendingCount} submission(s) awaiting review</div>
        </div>

        {/* Card 4: Total Outstanding Balance */}
        <div className="bg-[#12141a] border border-white/10 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-sm bg-white/5 text-zinc-300 flex items-center justify-center border border-white/10">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">₹{displayTotalOutstanding.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">Due at stage rehearsal / venue</div>
        </div>
      </div>

      {/* Mathematical Financial Integrity & Audit Balance Bar */}
      <div className="mb-6 p-4 rounded-sm bg-[#12141a] border border-white/10 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center text-[#C6FF00] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#C6FF00] font-bold">
                  FINANCIAL INTEGRITY &amp; MATHEMATICAL AUDIT
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm flex items-center space-x-1 ${
                  isEquationBalanced
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isEquationBalanced ? '100% MATHEMATICALLY BALANCED' : 'RECALCULATING BALANCES'}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-light mt-0.5">
                Total Contracted Intake: <strong className="text-white font-mono">₹{calculatedContractedFee.toLocaleString('en-IN')}</strong> ({displayTotalParticipants} Slots × ₹3,000) = Verified Collected: <strong className="text-emerald-400 font-mono">₹{displayVerifiedRevenue.toLocaleString('en-IN')}</strong> + Outstanding Due: <strong className="text-[#C6FF00] font-mono">₹{displayTotalOutstanding.toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono shrink-0 bg-[#080808] border border-white/10 px-4 py-2.5 rounded-sm">
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block">PENDING IN QUEUE</span>
              <span className="text-[#C6FF00] font-bold">₹{displayPendingAmount.toLocaleString('en-IN')} ({displayPendingCount} txs)</span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-zinc-500 text-[10px] uppercase block">SETTLED IN BANK</span>
              <span className="text-emerald-400 font-bold">₹{displayVerifiedRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official UPI Payment Recipient & Owner Verification Status Card */}
      <div className="bg-[#12141a] border border-white/10 rounded-sm p-4 sm:p-5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 font-mono-editorial">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Production UPI Configuration</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Official Recipient: B Sriram</span>
              <span className="text-xs font-mono text-[#C6FF00] font-normal">(`sri.469512-1@oksbi`)</span>
            </h3>
            <p className="text-xs text-zinc-400 font-light">
              Associated Mobile: <strong className="text-white">+91 93420 49287</strong> | Currency: <strong className="text-white">INR</strong> | Intent Deep Links: <strong className="text-[#C6FF00]">Google Pay, PhonePe, Paytm, BHIM, Generic UPI</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs shrink-0 bg-[#080808] border border-white/10 p-3 rounded-sm font-mono-editorial">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px] text-zinc-300">
              <strong className="text-white block font-semibold">Owner Verified &amp; Confirmed</strong>
              <span>Dynamic QR generation active on all checkouts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Verification Queue vs Participant Registry vs Storage */}
      <div className="flex items-center space-x-2 border-b border-white/10 mb-6 font-mono-editorial">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'queue'
              ? 'border-[#C6FF00] text-[#C6FF00]'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span>Payment Verification Queue</span>
          <span className="px-2 py-0.5 rounded-sm bg-[#C6FF00]/15 text-[#C6FF00] text-[10px] font-bold font-mono">
            {payments.filter(p => p.status === 'PENDING').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'participants'
              ? 'border-[#C6FF00] text-[#C6FF00]'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span>Participant Registry</span>
          <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white text-[10px] font-bold font-mono">
            {participants.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'storage'
              ? 'border-[#C6FF00] text-[#C6FF00]'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-[#C6FF00]" />
          <span>Storage &amp; DB Health (512 MB Limit)</span>
          {storageMetrics && (
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ml-1 ${
              storageMetrics.alert.level === 'NORMAL'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : storageMetrics.alert.level === 'INFORMATIONAL_WARNING'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : storageMetrics.alert.level === 'WARNING'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {storageMetrics.usagePercentage}%
            </span>
          )}
        </button>
      </div>

      {/* 6.2 PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-lg font-bold text-white">Payment Verification Queue</h2>
                <span className="px-2 py-0.5 rounded-sm bg-white/10 text-xs font-mono text-zinc-300">
                  {filteredPayments.length} shown
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review submitted candidate photographs, bank transaction proofs, and verify payments against actual bank records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Reg ID, UTR, Name..."
                  className="w-full bg-[#080808] border border-white/15 rounded-sm pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#080808] border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>

              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="bg-[#080808] border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
              >
                <option value="ALL">All Types</option>
                <option value="INITIAL_REGISTRATION">Initial Advance</option>
                <option value="BALANCE_PAYMENT">Balance Clearance</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0a0c12] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Registration ID</th>
                  <th className="py-3.5 px-4 text-center">Model Photo</th>
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">Payment Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Transaction Reference / UTR</th>
                  <th className="py-3.5 px-4 text-center">Payment Proof (Receipt)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-500">
                      No payment submissions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const participantName = (pay as any).participant?.full_name || 'Participant';
                    const mobile = (pay as any).participant?.whatsapp || (pay as any).participant?.mobile || '';
                    const photoUrl = pay.model_photo_url || null;
                    const photoKey = (pay as any).participant?.model_photo_r2_key;
                    const candidateCategory = (pay as any).participant?.category;

                    return (
                      <tr key={pay.id || pay.payment_id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* Registration ID with Copy Button */}
                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[#C6FF00]">{pay.reg_id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(pay.reg_id)}
                              className="p-1 hover:text-[#C6FF00] text-zinc-500 transition-colors"
                              title="Copy Registration ID"
                            >
                              {copiedText === pay.reg_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Model Photo Thumbnail (Clear & Inspectable) */}
                        <td className="py-3 px-4 text-center">
                          {photoUrl ? (
                            <div
                              onClick={() => handleViewCandidatePhoto(photoUrl, participantName, pay.reg_id, candidateCategory)}
                              className="group relative w-14 h-14 rounded-sm overflow-hidden border border-white/20 bg-black cursor-pointer hover:border-[#C6FF00] hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all shrink-0 mx-auto"
                              title={`Click to inspect high-resolution portrait of ${participantName}`}
                            >
                              <img
                                src={photoUrl}
                                alt={participantName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-[#C6FF00]" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[8px] font-mono-editorial text-center text-zinc-300">
                                PORTRAIT
                              </div>
                            </div>
                          ) : photoKey ? (
                            <button
                              type="button"
                              onClick={() => handleViewPhoto(photoKey, participantName, pay.reg_id, candidateCategory)}
                              className="w-14 h-14 rounded-sm border border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] hover:border-[#C6FF00] transition-all group shrink-0 mx-auto"
                              title={`Load portrait of ${participantName}`}
                            >
                              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span className="text-[9px] font-mono-editorial mt-0.5 text-[#C6FF00]">PHOTO</span>
                            </button>
                          ) : (
                            <div className="w-14 h-14 rounded-sm border border-white/10 bg-white/5 flex flex-col items-center justify-center text-zinc-600 shrink-0 mx-auto" title="No photo uploaded">
                              <User className="w-4 h-4 text-zinc-600" />
                              <span className="text-[8px] font-mono-editorial mt-0.5">NONE</span>
                            </div>
                          )}
                        </td>

                        {/* Participant Name */}
                        <td className="py-3 px-4 font-medium text-white">
                          <div>
                            <span className="block font-semibold">{participantName}</span>
                            {candidateCategory && (
                              <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">{candidateCategory}</span>
                            )}
                          </div>
                        </td>

                        {/* Payment Type */}
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-sm font-mono-editorial text-[10px] font-semibold uppercase ${
                            pay.payment_type === 'INITIAL_REGISTRATION'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          }`}>
                            {pay.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Advance' : 'Balance Clearance'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 font-bold text-white font-mono text-sm">
                          ₹{pay.amount.toLocaleString('en-IN')}
                        </td>

                        {/* Transaction Reference / UTR with Copy Button */}
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          <div className="flex items-center space-x-1.5">
                            <span className="select-all font-semibold">{pay.transaction_id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(pay.transaction_id)}
                              className="p-1 hover:text-[#C6FF00] text-zinc-500 transition-colors"
                              title="Copy UTR Reference"
                            >
                              {copiedText === pay.transaction_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Payment Proof Receipt Thumbnail (Clear & Inspectable) */}
                        <td className="py-3 px-4 text-center">
                          {pay.view_url && pay.view_url !== '/logo.png' ? (
                            <div
                              onClick={() => handleViewReceipt(pay)}
                              className="group relative w-14 h-14 rounded-sm overflow-hidden border border-white/20 bg-black cursor-pointer hover:border-[#C6FF00] hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all shrink-0 mx-auto"
                              title={`Click to inspect payment receipt for UTR: ${pay.transaction_id}`}
                            >
                              <img
                                src={pay.view_url}
                                alt={`Receipt ${pay.transaction_id}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-[#C6FF00]" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[8px] font-mono-editorial text-center text-[#C6FF00]">
                                RECEIPT
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleViewReceipt(pay)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-200 text-xs transition-colors border border-white/15 mx-auto"
                            >
                              <ZoomIn className="w-3.5 h-3.5 text-[#C6FF00]" />
                              <span>View</span>
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-sm font-mono-editorial text-[10px] font-bold uppercase ${
                            pay.status === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : pay.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30'
                          }`}>
                            {pay.status === 'VERIFIED' ? 'Verified' : pay.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          {pay.status === 'PENDING' && (
                            <>
                              <button
                                disabled={verifyingId === pay.payment_id}
                                onClick={() => handleVerify(pay.payment_id, 'VERIFY')}
                                className="px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono-editorial transition-colors"
                              >
                                {verifyingId === pay.payment_id ? 'Verifying...' : 'Verify'}
                              </button>
                              <button
                                disabled={verifyingId === pay.payment_id}
                                onClick={() => {
                                  setRejectModalPayment(pay);
                                  setSelectedReasonOption('Invalid transaction reference');
                                  setCustomReason('');
                                }}
                                className="px-3 py-1.5 rounded-sm bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-xs uppercase font-mono-editorial transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {mobile && (
                            <button
                              onClick={() => openWhatsApp(mobile, participantName, pay.reg_id, pay.status)}
                              className="px-2.5 py-1.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs transition-colors inline-flex items-center space-x-1"
                              title="Send WhatsApp Update"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => setDeletePaymentModal(pay)}
                            className="p-1.5 rounded-sm bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs transition-colors inline-flex items-center"
                            title="Delete Payment Submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Mathematical Table Summary Footer */}
              {filteredPayments.length > 0 && (
                <tfoot className="bg-[#08090d] border-t-2 border-white/20 text-zinc-300 font-mono text-xs">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 font-bold text-white">
                      TOTAL SUM ACROSS {filteredPayments.length} SUBMISSIONS SHOWN:
                    </td>
                    <td className="py-3 px-4 font-bold text-[#C6FF00] text-sm">
                      ₹{filteredPayments.reduce((acc, p) => acc + (typeof p.amount === 'number' ? p.amount : 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td colSpan={4} className="py-3 px-4 text-zinc-400 text-[11px]">
                      Verified: ₹{filteredPayments.filter(p => p.status === 'VERIFIED').reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-IN')} • 
                      Pending: ₹{filteredPayments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-IN')} • 
                      Rejected: ₹{filteredPayments.filter(p => p.status === 'REJECTED').reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Participant Registry Table */}
      {activeTab === 'participants' && (
        <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-lg font-bold text-white">Participant Registry</h2>
                <span className="px-2 py-0.5 rounded-sm bg-white/10 text-xs font-mono text-zinc-300">
                  {filteredParticipants.length} registered
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Complete database of registered runway contestants, profile portraits, and live financial settlement status.
              </p>
            </div>

            {/* Enhanced Search & Category Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <input
                  type="text"
                  value={participantSearchQuery}
                  onChange={(e) => setParticipantSearchQuery(e.target.value)}
                  placeholder="Search Name, Reg ID, Phone, City..."
                  className="w-full bg-[#080808] border border-white/15 rounded-sm pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              {/* Showcase Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#080808] border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
              >
                {CATEGORY_FILTER_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={participantStatusFilter}
                onChange={(e) => setParticipantStatusFilter(e.target.value)}
                className="bg-[#080808] border border-white/15 rounded-sm px-3 py-2 text-white text-xs focus:outline-none focus:border-[#C6FF00]"
              >
                <option value="ALL">All Statuses</option>
                <option value="FULLY_PAID">Fully Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0a0c12] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4"># Slot</th>
                  <th className="py-3.5 px-4">Reg ID</th>
                  <th className="py-3.5 px-4 text-center">Model Photo</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4">Verified Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Terms</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-zinc-500">
                      No contestant records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p, index) => {
                    const match = p.reg_id.match(/SC-2026-(\d+)/i);
                    const slotNum = match ? parseInt(match[1], 10) - 1000 : index + 1;
                    return (
                      <tr key={p.id || p.reg_id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className="px-2 py-0.5 rounded bg-[#C6FF00]/10 border border-[#C6FF00]/30 text-[#C6FF00] text-[11px]">
                            #{slotNum > 0 ? slotNum : index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-white">{p.reg_id}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(p.reg_id)}
                              className="p-1 hover:text-[#C6FF00] text-zinc-500 transition-colors"
                              title="Copy Registration ID"
                            >
                              {copiedText === p.reg_id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Model Photo Thumbnail (Clear & Inspectable) */}
                        <td className="py-3 px-4 text-center">
                          {p.model_photo_url ? (
                            <div
                              onClick={() => handleViewCandidatePhoto(p.model_photo_url!, p.full_name, p.reg_id, p.category)}
                              className="group relative w-14 h-14 rounded-sm overflow-hidden border border-white/20 bg-black cursor-pointer hover:border-[#C6FF00] hover:shadow-lg hover:shadow-[#C6FF00]/20 transition-all shrink-0 mx-auto"
                              title={`Click to preview full-size portrait of ${p.full_name}`}
                            >
                              <img
                                src={p.model_photo_url}
                                alt={p.full_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-[#C6FF00]" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[8px] font-mono-editorial text-center text-zinc-300">
                                PORTRAIT
                              </div>
                            </div>
                          ) : p.model_photo_r2_key ? (
                            <button
                              type="button"
                              onClick={() => handleViewPhoto(p.model_photo_r2_key, p.full_name, p.reg_id, p.category)}
                              className="w-14 h-14 rounded-sm border border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] hover:border-[#C6FF00] transition-all group shrink-0 mx-auto"
                              title="View Model Photograph"
                            >
                              <ZoomIn className="w-4 h-4 text-[#C6FF00] group-hover:scale-110 transition-transform" />
                              <span className="text-[9px] font-mono-editorial mt-0.5 text-[#C6FF00]">PHOTO</span>
                            </button>
                          ) : (
                            <div className="w-14 h-14 rounded-sm border border-white/10 bg-white/5 flex flex-col items-center justify-center text-zinc-600 shrink-0 mx-auto" title="No photo uploaded">
                              <User className="w-4 h-4 text-zinc-600" />
                              <span className="text-[8px] font-mono-editorial mt-0.5">NONE</span>
                            </div>
                          )}
                        </td>

                        {/* Full Name with 1-click Dossier Modal Opener */}
                        <td className="py-3 px-4 font-medium text-white">
                          <button
                            type="button"
                            onClick={() => setViewParticipantModal(p)}
                            className="text-left hover:text-[#C6FF00] transition-colors group flex items-center space-x-1.5"
                          >
                            <span className="font-semibold text-sm group-hover:underline">{p.full_name}</span>
                            <FileText className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#C6FF00] shrink-0" />
                          </button>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{p.city || 'Chennai'}</span>
                        </td>

                        {/* Category with distinct tag */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-zinc-300 font-mono-editorial text-[10px] font-semibold uppercase">
                            {p.category}
                          </span>
                        </td>

                        {/* Contact with 1-click copy & call */}
                        <td className="py-3 px-4 text-zinc-300 font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span>{p.whatsapp || p.mobile}</span>
                            {p.mobile && (
                              <button
                                type="button"
                                onClick={() => handleCopy(p.mobile)}
                                className="p-1 hover:text-[#C6FF00] text-zinc-500 transition-colors"
                                title="Copy Mobile Number"
                              >
                                {copiedText === p.mobile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Total Fee */}
                        <td className="py-3 px-4 font-bold text-white font-mono text-xs">
                          ₹{p.total_fee || 3000}
                        </td>

                        {/* Verified Paid */}
                        <td className="py-3 px-4 font-bold text-emerald-400 font-mono text-xs">
                          ₹{p.amount_paid}
                        </td>

                        {/* Outstanding Due */}
                        <td className="py-3 px-4 font-bold text-[#C6FF00] font-mono text-xs">
                          ₹{p.balance_due}
                        </td>

                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">{p.terms_version || '2026.2'}</td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded-sm font-mono-editorial text-[10px] font-bold uppercase ${
                            p.status === 'FULLY_PAID'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'PARTIALLY_PAID'
                              ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/30'
                              : p.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewParticipantModal(p)}
                            className="px-2.5 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs transition-colors inline-flex items-center space-x-1 font-mono-editorial"
                            title="Open Complete Candidate Dossier"
                          >
                            <FileText className="w-3 h-3 text-[#C6FF00]" />
                            <span>DETAILS</span>
                          </button>

                          <button
                            onClick={() => openWhatsApp(p.whatsapp || p.mobile, p.full_name, p.reg_id, p.status)}
                            className="px-2.5 py-1.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs transition-colors inline-flex items-center space-x-1"
                            title="Send WhatsApp Update"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => setDeleteParticipantModal(p)}
                            className="p-1.5 rounded-sm bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs transition-colors inline-flex items-center"
                            title="Delete Participant Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Mathematical Table Summary Footer */}
              {filteredParticipants.length > 0 && (
                <tfoot className="bg-[#08090d] border-t-2 border-white/20 text-zinc-300 font-mono text-xs">
                  <tr>
                    <td colSpan={6} className="py-3 px-4 font-bold text-white">
                      TOTAL MATHEMATICAL SUM ({filteredParticipants.length} CONTESTANTS SHOWN):
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{filteredParticipants.reduce((acc, p) => acc + (typeof p.total_fee === 'number' ? p.total_fee : 3000), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{filteredParticipants.reduce((acc, p) => acc + (typeof p.amount_paid === 'number' ? p.amount_paid : 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#C6FF00]">
                      ₹{filteredParticipants.reduce((acc, p) => acc + (typeof p.balance_due === 'number' ? p.balance_due : 0), 0).toLocaleString('en-IN')}
                    </td>
                    <td colSpan={3} className="py-3 px-4 text-zinc-400 text-[11px]">
                      Balance Check: Verified Paid + Outstanding = Total Fee
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* 6.3 DATABASE STORAGE MONITORING & HEALTH (512 MB LIMIT) */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* Top Health Status & Alert Banner */}
          {storageMetrics && (
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              storageMetrics.alert.level === 'NORMAL'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : storageMetrics.alert.level === 'INFORMATIONAL_WARNING'
                ? 'bg-blue-950/20 border-blue-500/30 text-blue-300'
                : storageMetrics.alert.level === 'WARNING'
                ? 'bg-amber-950/25 border-amber-500/40 text-amber-300'
                : 'bg-red-950/30 border-red-500/50 text-red-300'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    storageMetrics.alert.level === 'NORMAL'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : storageMetrics.alert.level === 'INFORMATIONAL_WARNING'
                      ? 'bg-blue-500/20 text-blue-400'
                      : storageMetrics.alert.level === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {storageMetrics.alert.level === 'NORMAL' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : storageMetrics.alert.level === 'INFORMATIONAL_WARNING' ? (
                      <Info className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{storageMetrics.alert.message}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-black/40 border border-current">
                        {storageMetrics.alert.level}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Recommended: {storageMetrics.alert.recommendedAction}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => loadDashboardData(false)}
                  disabled={loadingData}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs inline-flex items-center space-x-1.5 transition-colors shrink-0 ml-4"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                  <span>Refresh Stats</span>
                </button>
              </div>

              {/* Visual Storage Meter / Gauge */}
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-zinc-300">
                    Allocated Database Storage: <strong className="text-white">{storageMetrics.totalAllocatedMB} MB</strong> of {storageMetrics.storageLimitMB} MB Limit
                  </span>
                  <span className="font-mono font-bold text-[#C6FF00]">
                    {storageMetrics.usagePercentage}% Used ({storageMetrics.remainingCapacityMB} MB Free)
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      storageMetrics.usagePercentage < 60
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : storageMetrics.usagePercentage < 75
                        ? 'bg-gradient-to-r from-blue-500 to-amber-400'
                        : storageMetrics.usagePercentage < 85
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-orange-500 to-red-600 animate-pulse'
                    }`}
                    style={{ width: `${Math.max(1, Math.min(100, storageMetrics.usagePercentage))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>0 MB</span>
                  <span>Thresholds: 60% Notice (307 MB) | 75% Warning (384 MB) | 85% Critical (435 MB) | 95% Emergency (486 MB)</span>
                  <span>512 MB Max</span>
                </div>
              </div>
            </div>
          )}

          {/* 4 Summary Cards */}
          {storageMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Total Allocated Footprint</span>
                  <div className="w-8 h-8 rounded-sm bg-white/5 text-[#C6FF00] flex items-center justify-center border border-white/10">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{storageMetrics.totalAllocatedMB} MB</div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  WiredTiger disk extents + index structures
                </div>
              </div>

              <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Data vs Index Size</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {storageMetrics.dataSizeMB} MB <span className="text-xs text-zinc-500 font-normal">/ {storageMetrics.indexSizeMB} MB</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Compact JSON docs vs active indexes
                </div>
              </div>

              <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Estimated Registration Headroom</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {storageMetrics.estimatedRemainingRegistrations.toLocaleString('en-IN')}+
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Estimated capacity before reaching 512 MB
                </div>
              </div>

              <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Monthly Run-Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  ~{storageMetrics.estimatedMonthlyGrowthMB} MB
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Projected growth based on intake volume
                </div>
              </div>
            </div>
          )}

          {/* Collection Breakdown Table */}
          {storageMetrics && (
            <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">MongoDB Collection Breakdown</h3>
                  <p className="text-xs text-zinc-400">Storage metrics reported by WiredTiger engine in MongoDB Atlas.</p>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  Quota Cap: 512.00 MB Atlas M0 Cluster
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#0a0c12] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Collection Name</th>
                      <th className="py-3 px-4 text-right">Document Count</th>
                      <th className="py-3 px-4 text-right">Data Size (KB)</th>
                      <th className="py-3 px-4 text-right">Storage Extent (KB)</th>
                      <th className="py-3 px-4 text-right">Index Size (KB)</th>
                      <th className="py-3 px-4 text-right">Avg Doc Size</th>
                      <th className="py-3 px-4">Retention / Cleanup Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {storageMetrics.collections.map((col) => (
                      <tr key={col.name} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#C6FF00]">{col.name}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-white">{col.count}</td>
                        <td className="py-3.5 px-4 text-right text-zinc-300">{col.dataSizeKB} KB</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-zinc-200">{col.storageSizeKB} KB</td>
                        <td className="py-3.5 px-4 text-right text-zinc-400">{col.indexSizeKB} KB</td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400">{col.avgObjSizeBytes} B</td>
                        <td className="py-3.5 px-4">
                          {col.name === 'audit_logs' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              TTL: 90 Days Auto-Prune
                            </span>
                          ) : col.name === 'temporary_records' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              TTL: Expire on Expiry Time
                            </span>
                          ) : col.name === 'registrations' || col.name === 'payments' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Permanent Business Records
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                              Standard System
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Architectural Safeguards Card */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strict 512 MB Storage Architecture Safeguards</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-xl p-3 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Zero Binary / Base64 in MongoDB</strong>
                  <span>All model photographs and UPI payment screenshots are stored in private Cloudflare R2 bucket with 15-minute signed URLs. MongoDB stores only lightweight metadata keys (~1.0 KB/contestant).</span>
                </div>
              </div>

              <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-xl p-3 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Automated TTL Background Cleaning</strong>
                  <span>Expired upload reservations, rate-limit records, and temporary sessions are automatically deleted by MongoDB background TTL workers. 90-day retention policy on audit logs.</span>
                </div>
              </div>

              <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-xl p-3 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Strict Unique Integrity Indexes</strong>
                  <span>Unique compound indexes on `reg_id`, `transaction_id` (UTR), `phone_blind_index`, and `email_blind_index` prevent duplicate contestant submissions or double-payments.</span>
                </div>
              </div>

              <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-xl p-3 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Server-Side Pagination &amp; Projection</strong>
                  <span>Admin APIs use server-side `.skip()` and `.limit()` queries. Collections are never loaded unconstrained into serverless function memory.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purge Temporary Data & Reset to Zero Storage Action Card */}
          <div className="bg-red-950/25 border border-red-500/30 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-400 flex items-center space-x-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Purge Temporary Data &amp; Start With Zero Storage</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl font-light leading-relaxed">
                  Permanently deletes all temporary test records, participant submissions, and pending payments from MongoDB. Keeps official event settings and admin accounts intact, resetting database storage to clean zero baseline.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPurgeModalOpen(true)}
                className="px-5 py-2.5 rounded-sm bg-red-600 hover:bg-red-500 text-white font-mono-editorial text-xs font-bold uppercase tracking-wider transition-all shadow-lg shrink-0 flex items-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>PURGE &amp; START WITH ZERO STORAGE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State-of-the-art Image Lightbox Inspection Modal */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveMedia(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[95vh] bg-[#0d0f15] border border-white/20 rounded-sm shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#12141a]">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-0.5 rounded-sm font-mono-editorial text-[10px] font-bold uppercase tracking-wider ${
                  activeMedia.type === 'photo'
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeMedia.type === 'photo' ? 'MODEL PORTRAIT PHOTOGRAPH' : 'UPI PAYMENT PROOF RECEIPT'}
                </span>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white">
                    {activeMedia.title}
                  </h3>
                  {activeMedia.subtitle && (
                    <p className="text-xs font-mono text-zinc-400">
                      {activeMedia.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  className="p-2 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Zoom In (+25%)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Zoom Out (-25%)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomLevel(1); setRotation(0); }}
                  className="px-2 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors text-[10px] font-mono-editorial"
                  title="Reset Zoom &amp; Rotation"
                >
                  RESET
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <a
                  href={activeMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-sm bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
                  title="Open Raw Image in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMedia(null)}
                  className="p-2 rounded-sm bg-red-950/50 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 transition-colors ml-2"
                  title="Close Preview (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-Resolution Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-[#07080b] min-h-[380px] max-h-[68vh]">
              <div 
                className="transition-transform duration-200 ease-out origin-center select-none"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title}
                  className="max-h-[62vh] w-auto object-contain rounded-sm shadow-2xl border border-white/10"
                />
              </div>
            </div>

            {/* Inspection Details Footer */}
            {activeMedia.details && (
              <div className="px-5 py-3.5 border-t border-white/10 bg-[#12141a] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 font-mono">
                  {activeMedia.details.regId && (
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">REGISTRATION ID</span>
                      <span className="text-[#C6FF00] font-bold">{activeMedia.details.regId}</span>
                    </div>
                  )}
                  {activeMedia.details.name && (
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">CANDIDATE</span>
                      <span className="text-white font-medium">{activeMedia.details.name}</span>
                    </div>
                  )}
                  {activeMedia.details.amount && (
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">AMOUNT SUBMITTED</span>
                      <span className="text-emerald-400 font-bold">₹{activeMedia.details.amount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {activeMedia.details.transactionId && (
                    <div>
                      <span className="text-zinc-500 text-[10px] uppercase block">BANK UTR REFERENCE</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-white font-bold select-all">{activeMedia.details.transactionId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeMedia.details!.transactionId!)}
                          className="p-1 hover:text-[#C6FF00] text-zinc-500 transition-colors"
                          title="Copy UTR"
                        >
                          {copiedText === activeMedia.details.transactionId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {activeMedia.payment && activeMedia.payment.status === 'PENDING' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleVerify(activeMedia.payment!.payment_id, 'VERIFY');
                        setActiveMedia(null);
                      }}
                      className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider font-mono-editorial"
                    >
                      ✓ VERIFY THIS PAYMENT
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalPayment(activeMedia.payment!);
                        setSelectedReasonOption('Invalid transaction reference');
                        setCustomReason('');
                        setActiveMedia(null);
                      }}
                      className="px-4 py-2 rounded-sm bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-xs uppercase tracking-wider font-mono-editorial"
                    >
                      ✕ REJECT
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participant Dossier Quick View Modal */}
      {viewParticipantModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setViewParticipantModal(null)}
        >
          <div 
            className="relative max-w-3xl w-full max-h-[92vh] bg-[#12141a] border border-white/20 rounded-sm shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0f15]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center text-[#C6FF00]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block">
                    CANDIDATE DOSSIER
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">
                    {viewParticipantModal.full_name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-[#C6FF00] px-3 py-1 bg-black border border-[#C6FF00]/30 rounded-sm">
                  {viewParticipantModal.reg_id}
                </span>
                <button
                  type="button"
                  onClick={() => setViewParticipantModal(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-sm bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Large Model Photo */}
                <div className="w-full sm:w-48 shrink-0">
                  {viewParticipantModal.model_photo_url ? (
                    <div 
                      onClick={() => handleViewCandidatePhoto(
                        viewParticipantModal.model_photo_url!,
                        viewParticipantModal.full_name,
                        viewParticipantModal.reg_id,
                        viewParticipantModal.category
                      )}
                      className="group relative w-full aspect-[3/4] rounded-sm overflow-hidden border border-white/20 bg-black cursor-pointer hover:border-[#C6FF00] shadow-xl"
                    >
                      <img 
                        src={viewParticipantModal.model_photo_url} 
                        alt={viewParticipantModal.full_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-6 h-6 text-[#C6FF00]" />
                      </div>
                    </div>
                  ) : viewParticipantModal.model_photo_r2_key ? (
                    <button
                      type="button"
                      onClick={() => handleViewPhoto(viewParticipantModal.model_photo_r2_key, viewParticipantModal.full_name, viewParticipantModal.reg_id)}
                      className="w-full aspect-[3/4] rounded-sm border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] hover:border-[#C6FF00] transition-all"
                    >
                      <User className="w-8 h-8 mb-2" />
                      <span className="text-xs font-mono-editorial text-[#C6FF00]">CLICK TO LOAD PHOTO</span>
                    </button>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-sm border border-white/10 bg-white/5 flex flex-col items-center justify-center text-zinc-600">
                      <User className="w-8 h-8 mb-2 text-zinc-600" />
                      <span className="text-xs font-mono-editorial text-zinc-600">NO PHOTO ATTACHED</span>
                    </div>
                  )}
                </div>

                {/* Information Grid */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-sm bg-[#080808] border border-white/10">
                      <span className="text-zinc-500 font-mono-editorial text-[10px] uppercase block">CATEGORY</span>
                      <strong className="text-white text-sm">{viewParticipantModal.category}</strong>
                    </div>
                    <div className="p-3 rounded-sm bg-[#080808] border border-white/10">
                      <span className="text-zinc-500 font-mono-editorial text-[10px] uppercase block">GENDER &amp; CITY</span>
                      <strong className="text-white text-sm">{viewParticipantModal.gender} • {viewParticipantModal.city}</strong>
                    </div>
                    <div className="p-3 rounded-sm bg-[#080808] border border-white/10">
                      <span className="text-zinc-500 font-mono-editorial text-[10px] uppercase block">DATE OF BIRTH</span>
                      <strong className="text-white font-mono">{viewParticipantModal.dob}</strong>
                    </div>
                    <div className="p-3 rounded-sm bg-[#080808] border border-white/10">
                      <span className="text-zinc-500 font-mono-editorial text-[10px] uppercase block">REGISTRATION STATUS</span>
                      <span className={`inline-block px-2 py-0.5 rounded-sm font-mono-editorial text-[10px] font-bold uppercase mt-0.5 ${
                        viewParticipantModal.status === 'FULLY_PAID'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : viewParticipantModal.status === 'PARTIALLY_PAID'
                          ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30'
                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      }`}>
                        {viewParticipantModal.status}
                      </span>
                    </div>
                  </div>

                  {/* Financial Status Breakdown */}
                  <div className="p-4 rounded-sm bg-[#080808] border border-white/15 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-zinc-400">FINANCIAL BREAKDOWN:</span>
                      <span className="text-white">
                        Verified Paid: <strong className="text-emerald-400">₹{viewParticipantModal.amount_paid}</strong> / ₹{viewParticipantModal.total_fee || 3000}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#C6FF00] to-emerald-400"
                        style={{
                          width: `${Math.min(100, Math.round(((viewParticipantModal.amount_paid || 0) / (viewParticipantModal.total_fee || 3000)) * 100))}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-1">
                      <span>Balance Outstanding: <strong className="text-[#C6FF00]">₹{viewParticipantModal.balance_due}</strong></span>
                      <span>Progress: {Math.round(((viewParticipantModal.amount_paid || 0) / (viewParticipantModal.total_fee || 3000)) * 100)}%</span>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <a
                      href={`tel:${viewParticipantModal.mobile}`}
                      className="p-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-[#C6FF00]" />
                        <span>{viewParticipantModal.mobile}</span>
                      </div>
                      <span className="text-[10px] font-mono-editorial text-zinc-500">CALL</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => openWhatsApp(
                        viewParticipantModal.whatsapp || viewParticipantModal.mobile,
                        viewParticipantModal.full_name,
                        viewParticipantModal.reg_id,
                        viewParticipantModal.status
                      )}
                      className="p-2.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{viewParticipantModal.whatsapp || viewParticipantModal.mobile}</span>
                      </div>
                      <span className="text-[10px] font-mono-editorial">WHATSAPP</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Mandatory Reason */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Reject Payment Submission</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Rejecting payment for <strong>{(rejectModalPayment as any).participant?.full_name || rejectModalPayment.reg_id}</strong> of amount ₹{rejectModalPayment.amount}.
            </p>

            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Mandatory Reason <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedReasonOption}
              onChange={(e) => setSelectedReasonOption(e.target.value)}
              className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-400 mb-3"
            >
              {predefinedRejectionReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {selectedReasonOption === 'Other' && (
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify the exact reason for rejecting this payment..."
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-400 mb-4"
              />
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finalReason = selectedReasonOption === 'Other' ? (customReason.trim() || 'Payment rejected by administrator.') : selectedReasonOption;
                  handleVerify(rejectModalPayment.payment_id, 'REJECT', finalReason);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Participant Modal */}
      {deleteParticipantModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400 mb-3">
              <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Participant</h3>
                <span className="text-xs text-red-400 font-mono">{deleteParticipantModal.reg_id}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Are you sure you want to permanently delete contestant <strong className="text-white">{deleteParticipantModal.full_name}</strong>?
            </p>

            <div className="bg-[#0a0c12] border border-zinc-800 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Contestant Name:</span>
                <span className="text-white font-medium">{deleteParticipantModal.full_name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Registration ID:</span>
                <span className="text-[#C6FF00] font-bold">{deleteParticipantModal.reg_id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Fee / Verified Paid:</span>
                <span className="text-white font-medium">₹{deleteParticipantModal.total_fee} / ₹{deleteParticipantModal.amount_paid}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 mb-5 leading-relaxed">
              <strong>Notice on Sequential Gap Filling:</strong> Deleting this contestant frees Registration ID <strong>{deleteParticipantModal.reg_id}</strong>. The system will automatically recycle and assign this missing number to the next contestant who registers.
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteParticipantModal(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteParticipant(deleteParticipantModal.reg_id)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingId ? 'Deleting...' : 'Confirm Permanent Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Modal */}
      {deletePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400 mb-3">
              <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Payment Record</h3>
                <span className="text-xs text-red-400 font-mono">{deletePaymentModal.payment_id}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Delete payment record of amount <strong className="text-[#C6FF00]">₹{deletePaymentModal.amount}</strong> for participant <strong className="text-white">{deletePaymentModal.reg_id}</strong>?
            </p>

            <div className="bg-[#0a0c12] border border-zinc-800 rounded-xl p-3.5 mb-5 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Payment ID:</span>
                <span className="text-white">{deletePaymentModal.payment_id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>UTR Reference:</span>
                <span className="text-[#C6FF00]">{deletePaymentModal.transaction_id}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount:</span>
                <span className="text-emerald-400 font-bold">₹{deletePaymentModal.amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Status:</span>
                <span className="text-zinc-300">{deletePaymentModal.status}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletePaymentModal(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeletePayment(deletePaymentModal.payment_id)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingId ? 'Deleting...' : 'Confirm Delete Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zero Storage Purge Confirmation Modal */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141824] border-2 border-red-500/70 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <div className="p-3 rounded-full bg-red-500/15 border border-red-500/30">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reset Storage to Zero Baseline</h3>
                <span className="text-xs text-red-400 font-mono font-semibold uppercase">Permanent Clean Sweep</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4 font-light">
              This action will completely purge all temporary records, test registrations, pending payments, and transaction history from MongoDB Atlas.
            </p>

            <div className="bg-[#0a0c12] border border-zinc-800 rounded-xl p-4 mb-6 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Official event configuration and details remain safe</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Admin users and authentication sessions remain active</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>All test participant records &amp; payments will be deleted (0 KB)</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPurgeModalOpen(false)}
                disabled={purging}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeAllData}
                disabled={purging}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-lg shadow-red-950"
              >
                <Trash2 className="w-4 h-4" />
                <span>{purging ? 'Purging All Data...' : 'Confirm & Start With Zero Storage'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
