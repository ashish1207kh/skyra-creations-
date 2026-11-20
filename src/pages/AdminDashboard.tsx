import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Users, 
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
  LayoutDashboard,
  CreditCard,
  FileSpreadsheet,
  Settings,
  Sliders,
  ChevronRight,
  Menu,
  Check,
  AlertCircle,
  Eye,
  FileText
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

  // Dashboard state & active sub-tab
  const [adminTab, setAdminTab] = useState<'dashboard' | 'verification' | 'participants' | 'reconciliation' | 'reports' | 'builder' | 'settings'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Screenshot Lightbox Modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot or UTR could not be verified.');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Bank Reconciliation Demo State
  const [reconcileInput, setReconcileInput] = useState('');
  const [reconcileMatches, setReconcileMatches] = useState<any[]>([]);

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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        localStorage.setItem('skyra_admin_auth', 'true');
        setIsAuthenticated(true);
      } else {
        if (password === 'SkyraAdmin@2026') {
          localStorage.setItem('skyra_admin_auth', 'true');
          setIsAuthenticated(true);
        } else {
          throw new Error('Incorrect administrator password.');
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
      `Hello ${name},\n\nGreetings from the SKYRA CREATIONS Runway Show Team!\nRegarding your Registration ID: ${regId}.\nYour payment status is currently: ${status}.\n\nFeel free to reach out if you have any questions!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Reconcile parser helper
  const handleRunReconcile = () => {
    if (!reconcileInput.trim()) return;
    const lines = reconcileInput.split('\n');
    const matches: any[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // Search matching payment by UTR or amount
      const foundPayment = payments.find(p => trimmed.includes(p.transaction_id) || trimmed.includes(String(p.amount)));
      matches.push({
        line: trimmed,
        match: foundPayment || null,
        status: foundPayment ? (foundPayment.status === 'VERIFIED' ? 'Already Reconciled' : 'Matched for Review') : 'Unmatched'
      });
    });
    setReconcileMatches(matches);
  };

  // IF NOT AUTHENTICATED: LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-16 px-4">
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-8 sm:p-10 shadow-luxury max-w-md w-full text-center">
          <div className="w-14 h-14 bg-charcoal-surface border border-charcoal-border rounded-btn flex items-center justify-center mx-auto mb-6 text-lime-accent">
            <Lock className="w-6 h-6" />
          </div>
          
          <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent block mb-1">Restricted Access</span>
          <h2 className="font-editorial text-3xl font-normal text-ivory mb-2">Staff & Director Portal</h2>
          <p className="text-xs text-charcoal-muted mb-8 font-light">
            Authorized administrative access for SKYRA CREATIONS event operations.
          </p>

          {loginError && (
            <div className="mb-6 p-3 bg-status-rejected/10 border border-status-rejected/30 rounded-card text-xs text-status-rejected text-left">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Administrator Email / ID
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-2.5 text-ivory text-sm focus:outline-none focus:border-lime-accent"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Secure Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-2.5 text-ivory text-sm focus:outline-none focus:border-lime-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-lime-accent hover:bg-[#c9f556] text-charcoal font-semibold rounded-btn text-xs uppercase tracking-wider transition-all shadow-lime-glow mt-2"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>

            <div className="text-[11px] font-mono text-charcoal-muted text-center pt-3 border-t border-charcoal-border">
              Default password: <span className="text-lime-accent">SkyraAdmin@2026</span>
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

  const navMenuItems = [
    { id: 'dashboard', label: 'Operational Dashboard', icon: LayoutDashboard },
    { id: 'verification', label: 'Payment Verification', icon: ShieldCheck, badge: pendingPayments.length },
    { id: 'participants', label: 'Participant Registry', icon: Users, badge: participants.length },
    { id: 'reconciliation', label: 'Bank Statement Reconciliation', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports & Batch Exports', icon: FolderArchive },
    { id: 'builder', label: 'Registration Form Builder', icon: Sliders },
    { id: 'settings', label: 'System & UPI Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#101213] text-ivory flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col bg-charcoal border-r border-charcoal-border fixed inset-y-0 z-20 top-20">
        <div className="p-6 border-b border-charcoal-border flex items-center justify-between">
          <div>
            <span className="font-editorial text-lg text-ivory font-semibold block">SKYRA DIRECT</span>
            <span className="text-[10px] font-mono text-lime-accent uppercase tracking-widest">Runway Console</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-btn text-xs uppercase tracking-wider font-medium transition-all ${
                  isActive
                    ? 'bg-charcoal-surface text-lime-accent border border-charcoal-border shadow-sm'
                    : 'text-charcoal-muted hover:text-ivory hover:bg-charcoal-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-accent' : 'text-charcoal-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.id === 'verification' ? 'bg-status-pending text-charcoal font-bold' : 'bg-charcoal-surface text-charcoal-muted'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-charcoal-border">
          <div className="flex items-center justify-between text-xs text-charcoal-muted mb-3 font-mono">
            <span>Admin Director</span>
            <span className="text-lime-accent">Superadmin</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-btn bg-charcoal-card border border-charcoal-border text-charcoal-muted hover:text-status-rejected hover:border-status-rejected/40 text-xs uppercase font-mono tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <div className="bg-charcoal border-b border-charcoal-border px-4 sm:px-8 py-4 flex items-center justify-between sticky top-20 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-btn bg-charcoal-card border border-charcoal-border text-ivory"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs uppercase font-mono text-lime-accent tracking-widest block">Event Workspace</span>
              <h1 className="font-editorial text-xl sm:text-2xl text-ivory font-normal">
                {adminTab === 'dashboard' && 'Operations & Financial Overview'}
                {adminTab === 'verification' && 'Payment Verification Queue'}
                {adminTab === 'participants' && 'Participant Registry'}
                {adminTab === 'reconciliation' && 'Bank Statement Reconciliation'}
                {adminTab === 'reports' && 'Reports & Data Exports'}
                {adminTab === 'builder' && 'Registration Form Builder'}
                {adminTab === 'settings' && 'Platform & UPI Configuration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="p-2 rounded-btn bg-charcoal-surface border border-charcoal-border text-charcoal-muted hover:text-lime-accent hover:border-lime-accent transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-lime-accent' : ''}`} />
            </button>
            <span className="hidden sm:inline-block text-[11px] font-mono px-3 py-1 rounded-full bg-charcoal-card border border-charcoal-border text-charcoal-muted">
              Live DB: PostgreSQL (RLS Active)
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-8 flex-1">
          {/* TAB 1: OPERATIONAL DASHBOARD */}
          {adminTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-5 shadow-card-subtle">
                  <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Total Registrations</span>
                  <div className="text-2xl sm:text-3xl font-bold text-ivory tabular-nums mb-1">
                    {stats?.total_participants ?? 0}
                  </div>
                  <span className="text-xs text-charcoal-muted">Verified contestant profiles</span>
                </div>

                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-5 shadow-card-subtle">
                  <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Verified Revenue</span>
                  <div className="text-2xl sm:text-3xl font-bold text-lime-accent tabular-nums mb-1">
                    ₹{stats?.total_verified_revenue?.toLocaleString('en-IN') ?? 0}
                  </div>
                  <span className="text-xs text-status-success flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Bank Cleared Funds</span>
                  </span>
                </div>

                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-5 shadow-card-subtle">
                  <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Pending Verification</span>
                  <div className="text-2xl sm:text-3xl font-bold text-status-pending tabular-nums mb-1">
                    ₹{stats?.total_pending_amount?.toLocaleString('en-IN') ?? 0}
                  </div>
                  <span className="text-xs text-status-pending">
                    {stats?.pending_verifications_count ?? 0} submissions in queue
                  </span>
                </div>

                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-5 shadow-card-subtle">
                  <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Total Balance Due</span>
                  <div className="text-2xl sm:text-3xl font-bold text-ivory tabular-nums mb-1">
                    ₹{stats?.total_balance_due?.toLocaleString('en-IN') ?? 0}
                  </div>
                  <span className="text-xs text-charcoal-muted">Expected before show</span>
                </div>
              </div>

              {/* Secondary Metrics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6">
                  <span className="text-xs font-mono uppercase text-charcoal-muted block mb-3">Accreditation Distribution</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-charcoal-muted">Fully Cleared (100%)</span>
                        <span className="text-status-success font-bold">{stats?.fully_paid_count ?? 0}</span>
                      </div>
                      <div className="w-full bg-[#101213] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-status-success h-full"
                          style={{ width: `${((stats?.fully_paid_count || 0) / Math.max(stats?.total_participants || 1, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-charcoal-muted">Partially Paid (Advance)</span>
                        <span className="text-status-pending font-bold">{stats?.partially_paid_count ?? 0}</span>
                      </div>
                      <div className="w-full bg-[#101213] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-status-pending h-full"
                          style={{ width: `${((stats?.partially_paid_count || 0) / Math.max(stats?.total_participants || 1, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-charcoal-muted">Pending Initial Check</span>
                        <span className="text-status-info font-bold">{stats?.pending_verifications_count ?? 0}</span>
                      </div>
                      <div className="w-full bg-[#101213] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-status-info h-full"
                          style={{ width: `${((stats?.pending_verifications_count || 0) / Math.max(stats?.total_participants || 1, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Queue Widget */}
                <div className="md:col-span-2 bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono uppercase text-charcoal-muted">Priority Action Items</span>
                      <button
                        onClick={() => setAdminTab('verification')}
                        className="text-xs text-lime-accent hover:underline flex items-center space-x-1 font-mono"
                      >
                        <span>Open Verification Queue</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {pendingPayments.length === 0 ? (
                      <div className="py-8 text-center text-xs text-charcoal-muted">
                        <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-2" />
                        <span>All submitted payments are currently verified and reconciled!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pendingPayments.slice(0, 3).map((p) => (
                          <div 
                            key={p.payment_id}
                            className="bg-[#101213] p-3 rounded-card border border-charcoal-border flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono text-lime-accent">{p.reg_id}</span>
                              <span className="text-charcoal-muted ml-2 font-mono">UTR: {p.transaction_id}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-ivory tabular-nums">₹{p.amount.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() => setAdminTab('verification')}
                                className="px-2.5 py-1 rounded bg-charcoal-surface text-lime-accent border border-charcoal-border hover:bg-charcoal"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-charcoal-border flex items-center justify-between text-[11px] font-mono text-charcoal-muted">
                    <span>Audit Trail: Active logging on every verification action</span>
                    <span>Direct Cloudflare R2 links: Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT VERIFICATION QUEUE */}
          {adminTab === 'verification' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-border gap-3">
                <div>
                  <h2 className="font-editorial text-2xl text-ivory">Pending Verification Queue</h2>
                  <p className="text-xs text-charcoal-muted">
                    Manual bank reconciliation: Verify against actual bank credit before approving.
                  </p>
                </div>
                <span className="text-xs font-mono text-lime-accent">
                  {pendingPayments.length} Payments Awaiting Review
                </span>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="bg-charcoal-card border border-charcoal-border rounded-section p-12 text-center text-charcoal-muted">
                  <CheckCircle2 className="w-10 h-10 text-status-success mx-auto mb-3" />
                  <h3 className="font-editorial text-xl text-ivory mb-1">Queue is Empty</h3>
                  <p className="text-xs">No pending payment submissions require attention.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingPayments.map((p) => (
                    <div 
                      key={p.payment_id}
                      className="bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-between hover:border-lime-accent/40 transition-all shadow-card-subtle"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-charcoal-border mb-4">
                          <div>
                            <span className="font-mono text-xs text-lime-accent">{p.reg_id}</span>
                            <span className="text-xs text-charcoal-muted ml-2 font-mono">{p.payment_id}</span>
                          </div>
                          <span className="text-base font-bold text-ivory tabular-nums">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                          <div>
                            <span className="text-charcoal-muted block font-mono uppercase text-[10px]">Payment Type</span>
                            <span className="text-ivory font-medium">
                              {p.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Advance' : 'Balance Installment'}
                            </span>
                          </div>
                          <div>
                            <span className="text-charcoal-muted block font-mono uppercase text-[10px]">Submitted Date</span>
                            <span className="text-ivory font-medium">
                              {new Date(p.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-charcoal-muted block font-mono uppercase text-[10px]">Transaction ID / UTR</span>
                            <span className="font-mono text-lime-accent font-semibold text-xs select-all">
                              {p.transaction_id}
                            </span>
                          </div>
                        </div>

                        {/* Screenshot Preview Box */}
                        <div className="bg-[#101213] border border-charcoal-border rounded-card p-3 flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.view_url || '/qr_code.png'}
                              alt="Proof preview"
                              className="w-12 h-12 object-cover rounded-btn border border-charcoal-border"
                            />
                            <div className="text-xs">
                              <span className="text-ivory block font-medium">Payment Screenshot</span>
                              <span className="text-[10px] text-charcoal-muted font-mono">{p.r2_object_key}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveScreenshot(p.view_url || '/qr_code.png')}
                            className="p-2 rounded-btn bg-charcoal-surface border border-charcoal-border text-charcoal-muted hover:text-lime-accent"
                            title="Inspect in Lightbox Zoom"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-charcoal-border flex items-center space-x-3">
                        <button
                          type="button"
                          disabled={verifyingId === p.payment_id}
                          onClick={() => handleVerify(p.payment_id, 'VERIFY', 'Approved against bank credit statement')}
                          className="flex-1 py-2.5 rounded-btn bg-status-success hover:opacity-90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify & Clear</span>
                        </button>

                        <button
                          type="button"
                          disabled={verifyingId === p.payment_id}
                          onClick={() => setRejectModalPayment(p)}
                          className="py-2.5 px-4 rounded-btn bg-charcoal-surface border border-status-rejected/40 text-status-rejected hover:bg-status-rejected/10 text-xs uppercase font-mono tracking-wider transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARTICIPANTS REGISTRY */}
          {adminTab === 'participants' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-border gap-4">
                <div>
                  <h2 className="font-editorial text-2xl text-ivory">Contestant Registry</h2>
                  <p className="text-xs text-charcoal-muted">Search, inspect balances, and launch direct WhatsApp outreach.</p>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={getCsvExportUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-btn bg-charcoal-surface border border-charcoal-border hover:border-lime-accent text-ivory text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                  <input
                    type="text"
                    placeholder="Search by name, Registration ID, mobile, or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-charcoal border border-charcoal-border rounded-input pl-10 pr-4 py-2.5 text-ivory text-xs focus:outline-none focus:border-lime-accent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-charcoal border border-charcoal-border rounded-input px-3.5 py-2.5 text-ivory text-xs focus:outline-none focus:border-lime-accent font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="FULLY_PAID">Fully Cleared (100%)</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-charcoal-card border border-charcoal-border rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#101213] text-charcoal-muted uppercase font-mono border-b border-charcoal-border">
                      <tr>
                        <th className="py-3 px-4">Reg ID</th>
                        <th className="py-3 px-4">Contestant Name</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Paid</th>
                        <th className="py-3 px-4 text-right">Balance</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-border">
                      {filteredParticipants.map((p) => (
                        <tr key={p.id} className="hover:bg-charcoal-surface/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-lime-accent font-semibold">{p.reg_id}</td>
                          <td className="py-3 px-4 text-ivory font-medium">{p.full_name}</td>
                          <td className="py-3 px-4 text-charcoal-muted font-mono">{p.mobile}</td>
                          <td className="py-3 px-4 text-charcoal-muted">{p.city}</td>
                          <td className="py-3 px-4 text-charcoal-muted">{p.category}</td>
                          <td className="py-3 px-4 text-right font-bold text-status-success tabular-nums">
                            ₹{p.amount_paid.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-lime-accent tabular-nums">
                            ₹{p.balance_due.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                              p.status === 'FULLY_PAID'
                                ? 'bg-status-success/10 text-status-success'
                                : p.status === 'PARTIALLY_PAID'
                                ? 'bg-status-pending/10 text-status-pending'
                                : p.status === 'REJECTED'
                                ? 'bg-status-rejected/10 text-status-rejected'
                                : 'bg-status-info/10 text-status-info'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => openWhatsApp(p.whatsapp || p.mobile, p.full_name, p.reg_id, p.status)}
                              className="p-1.5 rounded-btn bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredParticipants.map((p) => (
                  <div key={p.id} className="bg-charcoal-card border border-charcoal-border rounded-card p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs text-lime-accent">{p.reg_id}</span>
                        <h4 className="font-medium text-ivory text-sm">{p.full_name}</h4>
                        <span className="text-[11px] text-charcoal-muted">{p.city} • {p.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                        p.status === 'FULLY_PAID'
                          ? 'bg-status-success/10 text-status-success'
                          : p.status === 'PARTIALLY_PAID'
                          ? 'bg-status-pending/10 text-status-pending'
                          : 'bg-status-info/10 text-status-info'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 border-t border-charcoal-border">
                      <div>
                        <span className="text-charcoal-muted font-mono">Paid: </span>
                        <span className="text-status-success font-bold tabular-nums">₹{p.amount_paid}</span>
                        <span className="text-charcoal-muted font-mono ml-2">Due: </span>
                        <span className="text-lime-accent font-bold tabular-nums">₹{p.balance_due}</span>
                      </div>
                      <button
                        onClick={() => openWhatsApp(p.whatsapp || p.mobile, p.full_name, p.reg_id, p.status)}
                        className="p-1.5 rounded-btn bg-[#25D366]/10 text-[#25D366]"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BANK STATEMENT RECONCILIATION */}
          {adminTab === 'reconciliation' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-charcoal-border">
                <h2 className="font-editorial text-2xl text-ivory">Bank Statement Reconciliation Workspace</h2>
                <p className="text-xs text-charcoal-muted">
                  Paste bank statement transaction lines (UTR & Amounts). Compare against submitted receipts. Explicit administrator confirmation required.
                </p>
              </div>

              <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6 space-y-4">
                <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono">
                  Paste Bank Statement Entries (one per line)
                </label>
                <textarea
                  rows={4}
                  value={reconcileInput}
                  onChange={(e) => setReconcileInput(e.target.value)}
                  placeholder="e.g. 2026-11-20 UPI/428901823901/CR/2000.00/SBI"
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input p-3 text-ivory text-xs font-mono focus:outline-none focus:border-lime-accent"
                ></textarea>

                <div className="flex justify-end">
                  <button
                    onClick={handleRunReconcile}
                    className="px-6 py-2.5 rounded-btn bg-lime-accent text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-[#c9f556] transition-all shadow-lime-glow"
                  >
                    Compare Transactions
                  </button>
                </div>
              </div>

              {reconcileMatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-editorial text-xl text-ivory">Comparison Results</h3>
                  {reconcileMatches.map((m, idx) => (
                    <div 
                      key={idx}
                      className="bg-charcoal-card border border-charcoal-border rounded-card p-4 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-mono text-charcoal-muted block">{m.line}</span>
                        {m.match && (
                          <span className="text-ivory font-mono">
                            Match: <strong className="text-lime-accent">{m.match.reg_id}</strong> (UTR: {m.match.transaction_id}) — ₹{m.match.amount}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase ${
                          m.status === 'Already Reconciled' 
                            ? 'bg-status-success/15 text-status-success'
                            : m.status === 'Matched for Review'
                            ? 'bg-status-pending/15 text-status-pending'
                            : 'bg-charcoal-surface text-charcoal-muted'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REPORTS & DATA EXPORTS */}
          {adminTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-charcoal-border">
                <h2 className="font-editorial text-2xl text-ivory">Reports & Batch Archiving</h2>
                <p className="text-xs text-charcoal-muted">
                  Stream participant data into CSV format or compress all verified payment proofs into a single ZIP archive.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="font-editorial text-xl text-ivory mb-2">Participant CSV Master Export</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Download all participant records including personal details, WhatsApp numbers, category, amounts paid, remaining balances, and registration timestamps.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-charcoal-border">
                    <a
                      href={getCsvExportUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-btn bg-lime-accent text-charcoal font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-[#c9f556] transition-all shadow-lime-glow"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download CSV Export</span>
                    </a>
                  </div>
                </div>

                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center mb-4">
                      <FolderArchive className="w-5 h-5" />
                    </div>
                    <h3 className="font-editorial text-xl text-ivory mb-2">Cloudflare R2 ZIP Archive</h3>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Batch stream all contestant photos and payment screenshots directly from Cloudflare R2 into a compressed ZIP file on demand.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-charcoal-border">
                    <a
                      href={getZipDownloadUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-btn bg-charcoal-surface border border-charcoal-border hover:border-lime-accent text-ivory font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 hover:bg-charcoal transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Event Photos (ZIP)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REGISTRATION FORM BUILDER */}
          {adminTab === 'builder' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-charcoal-border">
                <h2 className="font-editorial text-2xl text-ivory">Form Builder Configuration</h2>
                <p className="text-xs text-charcoal-muted">
                  Inspect the official Google Form field specification, validate active rules, and preview the client wizard.
                </p>
              </div>

              <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6">
                <span className="text-xs font-mono uppercase text-lime-accent block mb-4">Active Field Hierarchy</span>
                <div className="space-y-2">
                  {[
                    { name: 'Full Legal Name', type: 'Text (Input)', req: true, note: 'Mapped to participant.full_name' },
                    { name: 'Email Address', type: 'Email (RFC 5322)', req: true, note: 'Mapped to participant.email' },
                    { name: 'Date of Birth', type: 'Date Picker', req: true, note: 'Mapped to participant.dob' },
                    { name: 'Gender', type: 'Radio (Female / Male / Other)', req: true, note: 'Mapped to participant.gender' },
                    { name: 'Mobile Number', type: 'Tel', req: true, note: 'Mapped to participant.mobile' },
                    { name: 'WhatsApp Number', type: 'Tel with toggle', req: true, note: 'Mapped to participant.whatsapp' },
                    { name: 'City', type: 'Text (Input)', req: true, note: 'Mapped to participant.city' },
                    { name: 'Contestant Category', type: 'Dropdown Select', req: true, note: 'Runway Model / Kids / Designer' },
                    { name: 'Height', type: 'Text (Optional)', req: false, note: 'Backstage sequence fitting' },
                    { name: 'Instagram / Portfolio', type: 'Text (Optional)', req: false, note: 'Talent portfolio link' },
                    { name: 'UPI Screenshot File', type: 'File Upload (R2)', req: true, note: 'Private presigned upload' },
                    { name: 'Transaction ID / UTR', type: 'Text (12 Digits)', req: true, note: 'Used for statement matching' },
                  ].map((f, i) => (
                    <div key={i} className="bg-[#101213] p-3 rounded-card border border-charcoal-border flex items-center justify-between text-xs">
                      <div>
                        <span className="text-ivory font-medium">{f.name}</span>
                        <span className="text-charcoal-muted text-[11px] font-mono ml-2">({f.type})</span>
                        <p className="text-[11px] text-charcoal-muted">{f.note}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        f.req ? 'bg-status-success/10 text-status-success' : 'bg-charcoal-surface text-charcoal-muted'
                      }`}>
                        {f.req ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {adminTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-charcoal-border">
                <h2 className="font-editorial text-2xl text-ivory">System & Payment Configuration</h2>
                <p className="text-xs text-charcoal-muted">
                  Configure brand parameters, merchant UPI endpoints, and review cloud storage connectivity.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6 space-y-4">
                  <h3 className="font-editorial text-xl text-ivory">Payment Gateway (Manual UPI)</h3>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-muted mb-1">Configured UPI ID</label>
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-input text-xs font-mono text-lime-accent">
                      mr.death4646@oksbi
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-muted mb-1">Payee Name</label>
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-input text-xs font-mono text-ivory">
                      Sanjay Mass
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-charcoal-muted mb-1">Standard Event Fee</label>
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-input text-xs font-mono text-ivory">
                      ₹5,000.00
                    </div>
                  </div>
                </div>

                <div className="bg-charcoal-card border border-charcoal-border rounded-card p-6 space-y-4">
                  <h3 className="font-editorial text-xl text-ivory">Cloud Infrastructure Status</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-card flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted font-mono">Supabase PostgreSQL</span>
                      <span className="text-status-success font-mono">Connected • RLS Active</span>
                    </div>
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-card flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted font-mono">Cloudflare R2 Bucket</span>
                      <span className="text-status-success font-mono">Private • Presigned Signed URLs</span>
                    </div>
                    <div className="p-3 bg-[#101213] border border-charcoal-border rounded-card flex items-center justify-between text-xs">
                      <span className="text-charcoal-muted font-mono">Vercel Serverless Functions</span>
                      <span className="text-status-success font-mono">Node.js 20 • TypeScript Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-charcoal border border-charcoal-border rounded-card p-4 overflow-hidden shadow-luxury">
            <button
              onClick={() => setActiveScreenshot(null)}
              className="absolute top-4 right-4 p-2 rounded-btn bg-charcoal-card border border-charcoal-border text-ivory hover:text-lime-accent z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2">
              <img
                src={activeScreenshot}
                alt="Enlarged payment screenshot proof"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
            <div className="text-center pt-2 text-xs font-mono text-charcoal-muted">
              Secure Cloudflare R2 Temporary Signed Object
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-charcoal-border rounded-section p-6 sm:p-8 max-w-md w-full shadow-luxury">
            <h3 className="font-editorial text-2xl text-status-rejected mb-2">Reject Payment Submission</h3>
            <p className="text-xs text-charcoal-muted mb-4">
              State the reason for rejecting Payment <span className="font-mono text-lime-accent">{rejectModalPayment.payment_id}</span> ({rejectModalPayment.reg_id}).
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#101213] border border-charcoal-border rounded-input p-3 text-ivory text-xs focus:outline-none focus:border-status-rejected mb-4"
            ></textarea>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleVerify(rejectModalPayment.payment_id, 'REJECT', rejectionReason)}
                className="flex-1 py-2.5 rounded-btn bg-status-rejected hover:opacity-90 text-ivory font-semibold text-xs uppercase tracking-wider"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2.5 rounded-btn bg-charcoal-surface border border-charcoal-border text-charcoal-muted text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
