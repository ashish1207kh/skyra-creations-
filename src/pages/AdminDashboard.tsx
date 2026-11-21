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
  X, 
  RefreshCw, 
  FolderArchive,
  AlertCircle
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
  clearAdminToken
} from '../lib/api';
import { AdminStats, Participant, Payment } from '../types/index';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAdminToken()));

  // Login form state (no hardcoded passwords)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'queue' | 'participants'>('queue');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Screenshot Lightbox Modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
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
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [statsData, paymentsData, participantsData] = await Promise.all([
        getAdminStats(),
        getAdminPayments(),
        getAdminParticipants(),
      ]);
      setStats(statsData);
      setPayments(paymentsData);
      setParticipants(participantsData);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        handleLogout();
      } else {
        console.error('Failed to load admin data:', err);
      }
    } finally {
      setLoadingData(false);
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

  const handleViewPhoto = async (photoKey?: string | null) => {
    if (!photoKey) {
      alert('No model photograph uploaded for this participant.');
      return;
    }
    try {
      const res = await fetch(`/api/storage/presigned-view?key=${encodeURIComponent(photoKey)}`);
      const data = await res.json();
      if (data.view_url) {
        setActiveScreenshot(data.view_url);
      } else {
        alert('Could not generate view URL.');
      }
    } catch (err: any) {
      alert('Failed to load model photograph: ' + err.message);
    }
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
        <div className="bg-[#12151e] border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="w-20 h-20 bg-black border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 shadow-xl shadow-amber-500/10">
            <img src="/logo.png" alt="Skyra Creations Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white text-center mb-1">
            SKYRA CREATIONS — Administration
          </h2>
          <p className="text-xs text-zinc-400 text-center mb-6">
            Registration, payment verification and event management.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Administrator Email / Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skyracreations.com"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loginLoading ? 'Authenticating...' : 'Sign In to Operations Desk'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500">
              Authorized personnel only. All access is cryptographically audited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Payments for Queue
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.reg_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((p as any).participant?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 6. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-black border border-amber-500/30 rounded-2xl p-1.5 shadow-lg shrink-0">
            <img src="/logo.png" alt="Skyra Creations Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Operations Desk</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-0.5">
              SKYRA CREATIONS — Administration
            </h1>
            <p className="text-xs text-zinc-400">Registration, payment verification and event management.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            disabled={loadingData}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          {/* 6.4 Admin Exports */}
          <a
            href={getCsvExportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Registry (CSV)</span>
          </a>

          <a
            href={getZipDownloadUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Download Event Photos (ZIP)</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 6.1 METRICS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Participants Registered */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400">Total Participants Registered</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_participants}</div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {stats.fully_paid_count} Fully Paid • {stats.partially_paid_count} Partial
            </div>
          </div>

          {/* Card 2: Total Verified Revenue */}
          <div className="bg-[#12151e] border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">Total Verified Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">₹{stats.total_verified_revenue.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Settled &amp; Verified Payments</div>
          </div>

          {/* Card 3: Total Pending Verification Amount */}
          <div className="bg-[#12151e] border border-amber-500/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400">Pending Verification</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-400">₹{stats.total_pending_amount.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-zinc-400 mt-1">{stats.pending_verifications_count} submission(s) awaiting review</div>
          </div>

          {/* Card 4: Total Outstanding Balance */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400">Total Outstanding Balance</span>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">₹{stats.total_balance_due.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-zinc-500 mt-1">To be collected before event</div>
          </div>
        </div>
      )}

      {/* Tabs Switcher: Verification Queue vs Participant Registry */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'queue'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Payment Verification Queue ({payments.filter(p => p.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'participants'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Participant Registry ({participants.length})
        </button>
      </div>

      {/* 6.2 PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-white">Payment Verification</h2>
              <p className="text-xs text-zinc-400">Review submitted transaction details and verify payments against actual bank records.</p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Reg ID, UTR, Name..."
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0a0c12] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0a0c12] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Registration ID</th>
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">Payment Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Transaction Reference / UTR</th>
                  <th className="py-3.5 px-4">Proof</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500">
                      No payment submissions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const participantName = (pay as any).participant?.full_name || 'Participant';
                    const mobile = (pay as any).participant?.whatsapp || (pay as any).participant?.mobile || '';

                    return (
                      <tr key={pay.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{pay.reg_id}</td>
                        <td className="py-3.5 px-4 font-medium text-white">{participantName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            pay.payment_type === 'INITIAL_REGISTRATION'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                          }`}>
                            {pay.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Registration' : 'Balance Payment'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">₹{pay.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300 select-all">{pay.transaction_id}</td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setActiveScreenshot(pay.view_url || '/logo.png')}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                          >
                            <ZoomIn className="w-3 h-3 text-amber-400" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            pay.status === 'VERIFIED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : pay.status === 'REJECTED'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {pay.status === 'VERIFIED' ? 'Verified' : pay.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {pay.status === 'PENDING' && (
                            <>
                              <button
                                disabled={verifyingId === pay.payment_id}
                                onClick={() => handleVerify(pay.payment_id, 'VERIFY')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                              >
                                Verify
                              </button>
                              <button
                                disabled={verifyingId === pay.payment_id}
                                onClick={() => {
                                  setRejectModalPayment(pay);
                                  setSelectedReasonOption('Invalid transaction reference');
                                  setCustomReason('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 font-bold text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {mobile && (
                            <button
                              onClick={() => openWhatsApp(mobile, participantName, pay.reg_id, pay.status)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs transition-colors inline-flex items-center space-x-1"
                              title="Send WhatsApp Update"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Participant Registry Table */}
      {activeTab === 'participants' && (
        <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-6 border-b border-zinc-800">
            <h2 className="font-serif text-lg font-bold text-white">Participant Registry</h2>
            <p className="text-xs text-zinc-400">Complete database of registered runway contestants and payment progression.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0a0c12] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Reg ID</th>
                  <th className="py-3.5 px-4">Model Photo</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Total Fee</th>
                  <th className="py-3.5 px-4">Verified Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Terms</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{p.reg_id}</td>
                    <td className="py-3.5 px-4">
                      {p.model_photo_r2_key ? (
                        <button
                          onClick={() => handleViewPhoto(p.model_photo_r2_key)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs transition-colors"
                          title="View Model Photograph"
                        >
                          <ZoomIn className="w-3 h-3 text-amber-400" />
                          <span>Photo</span>
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-[11px] italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">{p.full_name}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{p.category}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{p.whatsapp || p.mobile}</td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{p.total_fee}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{p.amount_paid}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">₹{p.balance_due}</td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">{p.terms_version || '2026.2'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'FULLY_PAID'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : p.status === 'REJECTED'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openWhatsApp(p.whatsapp || p.mobile, p.full_name, p.reg_id, p.status)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-[#12151e] border border-zinc-700 rounded-2xl p-4 overflow-hidden">
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs text-zinc-400 mb-2 font-mono">Payment Proof Inspection</div>
            <img
              src={activeScreenshot}
              alt="Payment Screenshot Inspection"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
            />
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
    </div>
  );
}
