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
  FolderArchive
} from 'lucide-react';
import { 
  getAdminStats, 
  getAdminParticipants, 
  getAdminPayments, 
  verifyPayment, 
  getCsvExportUrl,
  getZipDownloadUrl 
} from '../lib/api';
import { supabase, isSupabaseAuthEnabled } from '../lib/supabaseClient';
import { AdminStats, Participant, Payment } from '../types/index';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('skyra_admin_auth'))
  );

  // Login form state
  const [email, setEmail] = useState('admin@skyracreations.com');
  const [password, setPassword] = useState('SkyraAdmin@2026');
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
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot or UTR could not be verified.');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

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
      if (isSupabaseAuthEnabled && supabase) {
        // Authenticate against Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        localStorage.setItem('skyra_admin_auth', 'true');
        setIsAuthenticated(true);
      } else {
        // Local administrative credentials
        if (password === 'SkyraAdmin@2026') {
          localStorage.setItem('skyra_admin_auth', 'true');
          setIsAuthenticated(true);
        } else {
          throw new Error('Incorrect password.');
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseAuthEnabled && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('skyra_admin_auth');
    setIsAuthenticated(false);
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
      setParticipants(participantsData.items || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerify = async (paymentId: string, action: 'VERIFY' | 'REJECT', reason = '') => {
    setVerifyingId(paymentId);
    try {
      await verifyPayment(paymentId, action, reason);
      await loadDashboardData();
      if (rejectModalPayment) setRejectModalPayment(null);
    } catch (err: any) {
      alert(err.message || 'Verification error occurred.');
    } finally {
      setVerifyingId(null);
    }
  };

  const openWhatsApp = (phone: string, name: string, regId: string, status: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${name},\n\nGreetings from Skyra Creations Runway Show Team!\nRegarding your Registration ID: ${regId}.\nYour payment status is: ${status}.\n\nFeel free to reply here if you have any questions!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // If not logged in, render Admin Login Card
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-[#12151e] border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="w-24 h-24 bg-black border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 shadow-xl shadow-amber-500/10">
            <img src="/logo.png" alt="Skyra Creations" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white text-center mb-1">Staff Portal</h2>
          <p className="text-xs text-zinc-400 text-center mb-6">Skyra Creations Runway Management</p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Admin Email / Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg"
            >
              {loginLoading ? 'Signing In...' : 'Sign In as Administrator'}
            </button>

            <div className="text-[11px] text-zinc-500 text-center pt-2">
              Default password: <span className="font-mono text-amber-400">SkyraAdmin@2026</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reg_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-black border border-amber-500/30 rounded-xl p-1.5 shadow-lg shrink-0">
            <img src="/logo.png" alt="Skyra Creations" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Admin Console</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              Skyra Creations Control Desk
            </h1>
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

          {/* Download Photos ZIP Button (Cloudflare R2 archive) */}
          <a
            href={getZipDownloadUrl()}
            download
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/40 transition-colors"
            title="Download all event photos and payment proofs as a ZIP file"
          >
            <FolderArchive className="w-4 h-4 text-amber-400" />
            <span>Download Photos (ZIP)</span>
          </a>

          {/* Export CSV Button */}
          <a
            href={getCsvExportUrl()}
            download
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-xl text-xs font-semibold border border-red-500/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Total Registrations</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total_participants}</div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {stats.fully_paid_count} fully paid • {stats.partially_paid_count} partial
            </div>
          </div>

          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Verified Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">₹{stats.total_verified_revenue.toLocaleString()}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Bank verified collections</div>
          </div>

          <div className="bg-[#12151e] border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
              <span>Verification Queue</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-300">{stats.pending_verifications_count}</div>
            <div className="text-[11px] text-amber-400/80 mt-1">
              ₹{stats.total_pending_amount.toLocaleString()} pending review
            </div>
          </div>

          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
              <span>Total Outstanding Balance</span>
              <IndianRupee className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white">₹{stats.total_balance_due.toLocaleString()}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Collectible via Balance Portal</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'queue'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span>Payment Verification Queue</span>
          {pendingPayments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-bold">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'participants'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <span>All Registered Participants ({participants.length})</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {pendingPayments.length === 0 ? (
            <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Verification Queue is Clear</h3>
              <p className="text-xs text-zinc-400 mt-1">All participant payment proofs have been reviewed.</p>
            </div>
          ) : (
            pendingPayments.map((p: any) => (
              <div
                key={p.payment_id}
                className="bg-[#12151e] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-5 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Participant & Payment details */}
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail click to zoom */}
                    <div 
                      onClick={() => setActiveScreenshot(p.view_url || '/qr_code.png')}
                      className="w-20 h-20 bg-[#0a0c12] rounded-xl border border-zinc-700 overflow-hidden shrink-0 cursor-pointer group relative"
                    >
                      <img 
                        src={p.view_url || '/qr_code.png'} 
                        alt="Proof" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{p.reg_id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                          {p.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Registration' : 'Balance Installment'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{p.participant?.full_name || 'Participant'}</h3>
                      <div className="text-xs text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Phone: <strong className="text-zinc-200">{p.participant?.mobile}</strong></span>
                        <span>UTR / Txn ID: <strong className="font-mono text-amber-300">{p.transaction_id}</strong></span>
                        <span>Submitted: {new Date(p.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center space-x-4 self-end lg:self-center">
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Amount Claimed</span>
                      <span className="text-xl font-bold text-white">₹{p.amount}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVerify(p.payment_id, 'VERIFY')}
                        disabled={verifyingId === p.payment_id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => setRejectModalPayment(p)}
                        disabled={verifyingId === p.payment_id}
                        className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      {p.participant && (
                        <button
                          onClick={() => openWhatsApp(p.participant.whatsapp || p.participant.mobile, p.participant.full_name, p.reg_id, 'Pending Verification')}
                          className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PARTICIPANTS REGISTRY */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by participant name, Reg ID, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12151e] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#12151e] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="FULLY_PAID">Fully Paid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0a0c12] text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">Reg ID</th>
                    <th className="py-3.5 px-4">Participant Name</th>
                    <th className="py-3.5 px-4">Category & City</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Financials</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                        No participants found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-xs">
                          {p.reg_id}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div>{p.full_name}</div>
                          <div className="text-[11px] text-zinc-500">{p.gender} • {p.dob}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-zinc-300">
                          <div>{p.category}</div>
                          <div className="text-zinc-500">{p.city}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="text-zinc-200 font-mono">{p.mobile}</div>
                          <div className="text-zinc-500 truncate max-w-[150px]">{p.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div>Paid: <strong className="text-emerald-400">₹{p.amount_paid}</strong></div>
                          <div>Due: <strong className="text-amber-400">₹{p.balance_due}</strong></div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
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
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 text-xs transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
            <div className="text-xs text-zinc-400 mb-2 font-mono">Cloudflare R2 Payment Proof Inspection (Presigned URL)</div>
            <img
              src={activeScreenshot}
              alt="Payment Screenshot Full Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141824] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Reject Payment</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Rejecting payment for <strong>{rejectModalPayment.participant_id}</strong> ({rejectModalPayment.reg_id}) of amount ₹{rejectModalPayment.amount}.
            </p>

            <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-400 mb-4"
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectModalPayment.payment_id, 'REJECT', rejectionReason)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs"
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
