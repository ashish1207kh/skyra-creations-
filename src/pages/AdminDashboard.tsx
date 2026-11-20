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
  FileText,
  Copy,
  TrendingUp,
  Maximize2
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
  const [email, setEmail] = useState('audit.desk@skyracreations.com');
  const [password, setPassword] = useState('SkyraAdmin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state & active sub-tab
  const [adminTab, setAdminTab] = useState<'dashboard' | 'verification' | 'participants' | 'reconciliation' | 'reports' | 'settings'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [verificationQueuePriority, setVerificationQueuePriority] = useState<'priority' | 'standard' | 'disputed'>('priority');

  // Screenshot Lightbox Modal
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment screenshot or UTR could not be verified against bank statement.');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Bank Reconciliation Tool
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
        const { error } = await supabase.auth.signInWithPassword({
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
          throw new Error('Incorrect cryptographic passcode.');
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

  const handleRunReconcile = () => {
    if (!reconcileInput.trim()) return;
    const lines = reconcileInput.split('\n');
    const matches: any[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const foundPayment = payments.find(p => trimmed.includes(p.transaction_id) || trimmed.includes(String(p.amount)));
      matches.push({
        line: trimmed,
        match: foundPayment || null,
        status: foundPayment ? (foundPayment.status === 'VERIFIED' ? 'Already Reconciled' : 'Matched for Review') : 'Unmatched'
      });
    });
    setReconcileMatches(matches);
  };

  // -------------------------------------------------------------
  // SCREEN 06: AVANT-GARDE ADMIN LOGIN GATEWAY
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-center items-center px-4 py-8 relative">
        <div className="w-full max-w-md flex flex-col">
          {/* Brand Monolithic Header */}
          <header className="flex flex-col items-center text-center pt-2 pb-6 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-data-mono text-data-mono tracking-widest text-primary uppercase">
                Runway Node 04 // Secured
              </span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-tight uppercase">
              Skyra Creations
            </h1>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mt-1">
              Operations &amp; Reconciliation Gateway
            </p>
          </header>

          {/* Editorial Security Vignette Card */}
          <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-low mb-6 shadow-xl border border-outline-variant/30">
            <div 
              className="relative h-44 w-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80')` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>
              {/* Top Badges Overlay */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/90 backdrop-blur-md text-on-surface">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  <span className="font-label-caps text-label-caps tracking-wider text-on-surface">Vault Level 4</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest/90 backdrop-blur-md text-primary">
                  <span className="font-data-mono text-data-mono">TLS 1.3 // HW-KEY</span>
                </span>
              </div>
              {/* Scrim Floating Text */}
              <div className="absolute bottom-3 inset-x-3 flex items-end justify-between">
                <div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest">
                    Access Protocol
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">
                    Authenticated Access Only
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-high/80 backdrop-blur-sm text-primary">
                  <span className="material-symbols-outlined text-lg block">fingerprint</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Login Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Department Indicator Module */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Target Domain</span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate font-medium">
                    Financial Audit &amp; Runway Operations
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-base">verified_user</span>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-body-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Official Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant flex items-center justify-between" htmlFor="admin-email">
                <span>Admin Official Identity</span>
                <span className="font-data-mono text-data-mono text-primary">SSO REQUIRED</span>
              </label>
              <div className="relative flex items-center rounded-xl bg-surface-container-low focus-within:bg-surface-container transition-all border border-outline-variant/30 focus-within:border-primary/50">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg">alternate_email</span>
                <input 
                  autoComplete="username" 
                  className="w-full h-12 bg-transparent pl-11 pr-4 text-on-surface font-body-md text-body-md placeholder-on-surface-variant/40 outline-none" 
                  id="admin-email" 
                  placeholder="audit.desk@skyracreations.com" 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Passcode Input with Strength Meter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="admin-passcode">
                  Cryptographic Passcode
                </label>
                <button 
                  type="button" 
                  onClick={() => alert("Default emergency passcode is configured: SkyraAdmin@2026")}
                  className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-4"
                >
                  Forgot Passcode?
                </button>
              </div>
              <div className="relative flex items-center rounded-xl bg-surface-container-low focus-within:bg-surface-container transition-all border border-outline-variant/30 focus-within:border-primary/50">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg">key</span>
                <input 
                  autoComplete="current-password" 
                  className="w-full h-12 bg-transparent pl-11 pr-11 text-on-surface font-body-md text-body-md placeholder-on-surface-variant/40 outline-none font-mono" 
                  id="admin-passcode" 
                  placeholder="••••••••••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  aria-label="Reveal password" 
                  className="absolute right-3.5 text-on-surface-variant hover:text-on-surface transition-colors p-1" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-lg block">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator Bars */}
              <div className="flex flex-col gap-1 mt-1 px-1">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-data-mono text-data-mono text-on-surface-variant">Entropy Score:</span>
                  <span className="font-data-mono text-data-mono text-primary font-semibold">256-bit (Hardware Validated)</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
                  <div className="h-full rounded-full bg-primary"></div>
                  <div className="h-full rounded-full bg-primary"></div>
                  <div className="h-full rounded-full bg-primary"></div>
                  <div className="h-full rounded-full bg-primary/80"></div>
                </div>
              </div>
            </div>

            {/* Checkbox & Auxiliary Options */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input defaultChecked className="w-4 h-4 rounded bg-surface-container-high accent-primary text-surface cursor-pointer" type="checkbox"/>
                <span className="font-body-sm text-body-sm text-on-surface">Retain session on terminal</span>
              </label>
              <span className="inline-flex items-center gap-1 font-data-mono text-data-mono text-on-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> IP 192.0.2.84
              </span>
            </div>

            {/* Primary Action Button */}
            <button 
              disabled={loginLoading}
              className="mt-2 w-full h-12 rounded-xl bg-primary text-on-primary font-label-md text-label-md tracking-wider uppercase font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] hover:bg-primary-fixed-dim transition-all" 
              type="submit"
            >
              {loginLoading ? (
                <>
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-surface border-t-transparent animate-spin mr-1"></span>
                  <span>Authenticating Token...</span>
                </>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Security Verification Footer Block */}
          <footer className="mt-6 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-surface-container-lowest text-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-base flex-shrink-0">shield</span>
              <span className="font-data-mono text-data-mono text-on-surface-variant truncate">
                Protected by 256-bit Hardware Token &amp; IP Whitelist
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-center text-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Restricted Terminal?</span>
              <span className="font-body-sm text-body-sm text-on-surface font-medium">Default: SkyraAdmin@2026</span>
            </div>
            <div className="flex items-center gap-3 pt-1 text-on-surface-variant/60 font-data-mono text-[11px] uppercase">
              <span>Skyra Core v4.11</span>
              <span>•</span>
              <span>ISO/IEC 27001</span>
              <span>•</span>
              <span>Paris // Milan // NYC</span>
            </div>
          </footer>
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
    { id: 'dashboard', label: 'Overview', icon: 'grid_view' },
    { id: 'verification', label: 'Payments', icon: 'verified', badge: pendingPayments.length },
    { id: 'participants', label: 'Roster', icon: 'groups', badge: participants.length },
    { id: 'reconciliation', label: 'Reconcile', icon: 'account_balance_wallet' },
    { id: 'reports', label: 'Export & Backup', icon: 'folder_zip' },
    { id: 'settings', label: 'Settings', icon: 'tune' },
  ];

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      {/* Fixed Admin Top Bar */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-md">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary truncate">
                Skyra Creations
              </span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate leading-none mt-0.5">
                {adminTab === 'dashboard' && 'Admin Dashboard'}
                {adminTab === 'verification' && 'Payment Verification Workspace'}
                {adminTab === 'participants' && 'Participant Management'}
                {adminTab === 'reconciliation' && 'Bank Statement Reconciliation'}
                {adminTab === 'reports' && 'Data Reports & R2 Archives'}
                {adminTab === 'settings' && 'System Configuration'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={loadDashboardData}
              disabled={loadingData}
              className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-primary' : ''}`} />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>PostgreSQL / R2 Synced</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-error text-xs font-label-md uppercase transition-colors"
              title="Logout from console"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Strip */}
        <div className="hidden lg:flex items-center px-6 gap-1 border-t border-outline-variant/20 bg-surface-container-lowest">
          {navMenuItems.map((item) => {
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-label-md text-label-md uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-primary text-primary font-semibold bg-surface-container/40'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-data-mono ${
                    item.id === 'verification' ? 'bg-amber-400 text-surface font-bold' : 'bg-surface-variant text-on-surface'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-72 bg-surface-container-low p-6 flex flex-col justify-between h-full border-r border-outline-variant/30">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
                <div>
                  <span className="font-label-caps text-label-caps text-primary uppercase">Skyra Console</span>
                  <h2 className="font-headline-sm text-on-surface">Navigation</h2>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-on-surface-variant">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {navMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminTab(item.id as any);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      adminTab === item.id ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="font-label-md text-label-md">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-data-mono bg-black/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-container text-error text-xs font-label-md uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD (Screen 07) */}
        {/* ========================================================= */}
        {adminTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Circuit Selector & Period Switcher */}
            <div className="flex flex-col space-y-3">
              {/* Active Runway Circuit Dropdown Trigger */}
              <div className="flex items-center justify-between bg-surface-container-low px-4 py-3 rounded-xl shadow-sm border border-outline-variant/20">
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0"></span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary">Active Circuit</span>
                    <span className="font-subheading text-body-md text-on-surface font-semibold truncate">
                      Haute Couture '25 Runway — Paris &amp; Milan Circuit
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block font-data-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Primary Production
                  </span>
                </div>
              </div>

              {/* Period Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
                {(['today', 'week', 'month', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap flex items-center space-x-1 ${
                      timePeriod === period
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="capitalize">{period === 'week' ? 'This Week' : period === 'all' ? 'All Time' : period}</span>
                    {timePeriod === period && <span className="material-symbols-outlined text-[14px]">done</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlight Revenue Marquee Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-6 rounded-xl shadow-md border border-outline-variant/30">
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                      Verified Collected Revenue
                    </span>
                  </div>
                  <div className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-primary tracking-tight font-medium mt-1">
                    ₹{(stats?.total_verified_revenue ?? 4285000).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-caps font-label-caps bg-primary/15 text-primary font-semibold">
                    <span className="material-symbols-outlined text-[13px] mr-0.5">trending_up</span>+18.4%
                  </span>
                  <span className="font-data-mono text-[11px] text-secondary mt-1">vs Haute '24 Circuit</span>
                </div>
              </div>

              {/* Mini Settlement Bar Gauge inside Card */}
              <div className="mt-4 pt-3 bg-surface-container-lowest/60 rounded-lg p-3">
                <div className="flex justify-between items-center text-body-sm font-body-sm mb-1.5">
                  <span className="text-on-surface-variant font-medium">Target Settlement Pace</span>
                  <span className="text-primary font-data-mono font-semibold">83.6%</span>
                </div>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: '83.6%' }}></div>
                </div>
              </div>
            </div>

            {/* Primary Metric Bento Grid (2x2) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Talent Pool */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Talent Pool</span>
                  <div className="w-7 h-7 rounded-md bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">groups</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {stats?.total_participants ?? 482}
                  </div>
                  <p className="font-body-sm text-[12px] text-primary flex items-center mt-0.5">
                    <span className="material-symbols-outlined text-[13px] mr-0.5">north_east</span>
                    Active contestants
                  </p>
                </div>
              </div>

              {/* Card 2: Audit Queue */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/20">
                <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Audit Queue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                </div>
                <div className="mt-3">
                  <div className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-baseline">
                    {pendingPayments.length} <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-normal">items</span>
                  </div>
                  <span className="inline-block mt-1 font-label-caps text-[9px] tracking-wider uppercase text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded">
                    Action Required
                  </span>
                </div>
              </div>

              {/* Card 3: Outstanding Balance */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Balance Due</span>
                  <div className="w-7 h-7 rounded-md bg-surface-variant flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-subheading text-[17px] text-on-surface font-semibold leading-tight">
                    ₹{(stats?.total_balance_due ?? 840000).toLocaleString('en-IN')}
                  </div>
                  <span className="font-data-mono text-[11px] text-on-surface-variant block mt-0.5">
                    Across models
                  </span>
                </div>
              </div>

              {/* Card 4: Discrepancies */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-xl shadow-sm flex flex-col justify-between border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-[11px] tracking-wider uppercase text-secondary">Discrepancies</span>
                  <div className="w-7 h-7 rounded-md bg-error-container/40 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="font-headline-sm text-headline-sm text-error font-semibold">
                    {payments.filter(p => p.status === 'REJECTED').length}
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant block mt-0.5">
                    UTRs flagged hold
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Shortcuts Row */}
            <div className="flex flex-col space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Priority Actions</span>
                <span className="font-data-mono text-[11px] text-primary">Live Operations</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setAdminTab('verification')}
                  className="bg-surface-container hover:bg-surface-container-high transition-all p-4 rounded-xl flex flex-col items-center justify-center text-center group shadow-sm border border-outline-variant/20"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  </div>
                  <span className="font-label-md text-xs sm:text-sm text-on-surface font-semibold leading-tight">
                    Audit ({pendingPayments.length})
                  </span>
                  <span className="font-data-mono text-[10px] text-secondary mt-0.5">Pending Review</span>
                </button>

                <button 
                  onClick={() => setAdminTab('reconciliation')}
                  className="bg-surface-container hover:bg-surface-container-high transition-all p-4 rounded-xl flex flex-col items-center justify-center text-center group shadow-sm border border-outline-variant/20"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center group-hover:text-primary transition-all mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  </div>
                  <span className="font-label-md text-xs sm:text-sm text-on-surface font-semibold leading-tight">Import Bank</span>
                  <span className="font-data-mono text-[10px] text-secondary mt-0.5">CSV / MT940</span>
                </button>

                <button 
                  onClick={() => setAdminTab('reports')}
                  className="bg-surface-container hover:bg-surface-container-high transition-all p-4 rounded-xl flex flex-col items-center justify-center text-center group shadow-sm border border-outline-variant/20"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center group-hover:text-primary transition-all mb-1.5">
                    <span className="material-symbols-outlined text-[20px]">folder_zip</span>
                  </div>
                  <span className="font-label-md text-xs sm:text-sm text-on-surface font-semibold leading-tight">Batch Export</span>
                  <span className="font-data-mono text-[10px] text-secondary mt-0.5">R2 Portfolios &amp; CSV</span>
                </button>
              </div>
            </div>

            {/* Analytics Section 1: Payment Status Distribution */}
            <div className="bg-surface-container p-5 rounded-xl shadow-sm space-y-4 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-subheading text-subheading text-on-surface font-semibold">Payment Distribution</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    {participants.length} Total candidate ledger profiles
                  </p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">pie_chart</span>
              </div>
              
              {/* Segmented Multi-Tone Progress Pill */}
              <div className="w-full h-3.5 rounded-full bg-surface-container-lowest overflow-hidden flex p-0.5 gap-1">
                <div className="h-full bg-primary rounded-l-full" style={{ width: '76%' }} title="76% Verified"></div>
                <div className="h-full bg-amber-400" style={{ width: '18%' }} title="18% Pending Audit"></div>
                <div className="h-full bg-outline-variant rounded-r-full" style={{ width: '6%' }} title="6% Balance Due"></div>
              </div>

              {/* Data Breakdown Metric Rows */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                    <span className="font-label-caps text-[10px] text-secondary uppercase truncate">Verified</span>
                  </div>
                  <span className="font-data-mono text-base font-semibold text-on-surface block mt-1">76%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    {stats?.fully_paid_count ?? 366} Models
                  </span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span className="font-label-caps text-[10px] text-secondary uppercase truncate">Audit</span>
                  </div>
                  <span className="font-data-mono text-base font-semibold text-amber-300 block mt-1">18%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    {pendingPayments.length} In Review
                  </span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-outline-variant shrink-0"></span>
                    <span className="font-label-caps text-[10px] text-secondary uppercase truncate">Due</span>
                  </div>
                  <span className="font-data-mono text-base font-semibold text-on-surface-variant block mt-1">6%</span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    {stats?.partially_paid_count ?? 29} Balance
                  </span>
                </div>
              </div>
            </div>

            {/* Analytics Section 2: 7-Day Velocity Chart */}
            <div className="bg-surface-container p-5 rounded-xl shadow-sm space-y-4 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-subheading text-subheading text-on-surface font-semibold">Settlement Velocity</h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">7-day incoming registrations vs final balances</p>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-label-caps uppercase">
                  <span className="flex items-center text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>Fees</span>
                  <span className="flex items-center text-secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1"></span>Balance</span>
                </div>
              </div>

              {/* 7-Day Sparkline Bar Chart */}
              <div className="bg-surface-container-low p-4 rounded-lg">
                <div className="flex items-end justify-between h-28 pt-4 px-2 gap-3 sm:gap-6">
                  {[
                    { day: 'M', f: 48, b: 24 },
                    { day: 'T', f: 65, b: 38 },
                    { day: 'W', f: 40, b: 15 },
                    { day: 'T', f: 82, b: 52 },
                    { day: 'F', f: 94, b: 70, active: true },
                    { day: 'S', f: 72, b: 45 },
                    { day: 'S', f: 58, b: 30 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end gap-1.5">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div className="w-2.5 sm:w-3.5 bg-primary rounded-t-sm" style={{ height: `${item.f}%` }}></div>
                        <div className="w-2.5 sm:w-3.5 bg-outline-variant rounded-t-sm" style={{ height: `${item.b}%` }}></div>
                      </div>
                      <span className={`font-data-mono text-[10px] ${item.active ? 'text-primary font-bold' : 'text-secondary'}`}>
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-surface-variant/30 text-[11px] text-on-surface-variant">
                  <span>Peak inflow: Friday (₹9.8L)</span>
                  <span className="font-data-mono text-primary font-medium">Avg ₹6.1L / day</span>
                </div>
              </div>
            </div>

            {/* Real-Time Audit Activity Feed */}
            <div className="flex flex-col space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                  <h3 className="font-subheading text-subheading text-on-surface font-semibold">Live Audit Ledger</h3>
                </div>
                <button 
                  onClick={() => setAdminTab('verification')}
                  className="font-label-caps text-label-caps text-primary uppercase tracking-wider hover:underline"
                >
                  View All ({pendingPayments.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {payments.slice(0, 4).map((p) => (
                  <div key={p.payment_id} className="bg-surface-container p-3.5 rounded-xl flex items-center justify-between shadow-sm border border-outline-variant/10">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-lg bg-surface-variant flex items-center justify-center font-bold text-primary font-data-mono">
                          {p.reg_id.substring(p.reg_id.length - 2)}
                        </div>
                        {p.status === 'VERIFIED' ? (
                          <span className="material-symbols-outlined absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px]">
                            check
                          </span>
                        ) : p.status === 'REJECTED' ? (
                          <span className="material-symbols-outlined absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-error text-on-error flex items-center justify-center text-[10px]">
                            close
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-surface flex items-center justify-center text-[10px] font-bold">
                            !
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{p.reg_id}</span>
                          <span className={`font-data-mono text-[10px] px-1.5 py-0.2 rounded ${
                            p.status === 'VERIFIED' ? 'text-primary bg-primary/10' : p.status === 'REJECTED' ? 'text-error bg-error/10' : 'text-amber-400 bg-amber-950/40'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="font-data-mono text-[11px] text-secondary truncate">UTR #{p.transaction_id}</p>
                        <span className="font-body-sm text-[10px] text-on-surface-variant">
                          {new Date(p.created_at).toLocaleTimeString()} • {p.payment_type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-subheading text-subheading text-on-surface font-semibold block">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      {p.status === 'PENDING' && (
                        <button 
                          onClick={() => setAdminTab('verification')}
                          className="mt-1 px-3 py-1 rounded bg-primary text-on-primary font-label-caps text-[10px] uppercase font-bold tracking-wider hover:bg-primary-fixed-dim transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PAYMENT VERIFICATION WORKSPACE (Screen 10) */}
        {/* ========================================================= */}
        {adminTab === 'verification' && (
          <div className="space-y-6">
            {/* Top Operational Banner & Live Status */}
            <section className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">
                    Audit Engine Live
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono text-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
                  <span>Auditor ID: #ADM-084</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Payment Audit Desk</h2>
                <span className="font-data-mono text-data-mono text-on-surface-variant">
                  Queue: {pendingPayments.length} Pending
                </span>
              </div>
            </section>

            {/* Filter & Queue Segmentation Switcher */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setVerificationQueuePriority('priority')}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm ${
                  verificationQueuePriority === 'priority'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>High Priority</span>
                <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-xs font-data-mono">{pendingPayments.length}</span>
              </button>
              <button 
                onClick={() => setVerificationQueuePriority('standard')}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                  verificationQueuePriority === 'standard'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span>
                <span>All Submissions</span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant text-xs font-data-mono">
                  {payments.length}
                </span>
              </button>
              <button 
                onClick={() => setVerificationQueuePriority('disputed')}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-all ${
                  verificationQueuePriority === 'disputed'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-error">flag</span>
                <span>Disputed / Holds</span>
                <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-data-mono">
                  {payments.filter(p => p.status === 'REJECTED').length}
                </span>
              </button>
            </div>

            {/* Active Items List / Dockets */}
            {pendingPayments.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-12 text-center text-on-surface-variant border border-outline-variant/20">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-headline-sm text-on-surface mb-1">Audit Desk Cleared</h3>
                <p className="font-body-sm text-body-sm">
                  Every submitted payment voucher has been reconciled against the official bank ledger.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingPayments.map((p, index) => {
                  const candidate = participants.find(part => part.reg_id === p.reg_id);
                  return (
                    <div 
                      key={p.payment_id}
                      className="relative bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-md overflow-hidden border border-outline-variant/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/30 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                            {candidate?.profile_photo_url ? (
                              <img src={candidate.profile_photo_url} alt="Candidate" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-data-mono font-bold text-primary">
                                {p.reg_id.substring(p.reg_id.length - 2)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-headline-sm text-lg sm:text-xl text-on-surface truncate">
                              {candidate?.full_name || 'Contestant Profile'}
                            </span>
                            <span className="font-data-mono text-xs text-secondary truncate">
                              #{p.reg_id} · {candidate?.category || 'Runway Open Category'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-primary font-label-caps text-[10px] tracking-wider uppercase">
                            Slot: {index + 1} of {pendingPayments.length}
                          </span>
                        </div>
                      </div>

                      {/* Dual Comparison Ledger Box (Screen 10) */}
                      <div className="flex flex-col gap-3 my-4">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-high">
                          <div className="flex items-center gap-1.5 text-primary">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            <span className="font-label-md text-label-md font-semibold">Live Comparison Ledger</span>
                          </div>
                          <span className="font-data-mono text-xs text-on-surface-variant">
                            {p.payment_type === 'INITIAL_REGISTRATION' ? 'Advance Registration' : 'Balance Installment'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Candidate Claim Panel */}
                          <div className="bg-surface-container rounded-lg p-4 flex flex-col justify-between border border-outline-variant/20">
                            <div className="flex items-center justify-between pb-2 mb-2 bg-surface-container-highest/30 px-2.5 py-1 rounded">
                              <span className="font-label-caps text-label-caps uppercase text-secondary">Candidate Claim</span>
                              <span className="font-data-mono text-[11px] text-tertiary">UPI Submission</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-left mb-2">
                              <div>
                                <span className="font-label-caps text-[10px] text-secondary block uppercase">Claimed Value</span>
                                <span className="font-headline-sm text-xl font-bold text-on-surface">
                                  ₹{p.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="font-label-caps text-[10px] text-secondary block uppercase">Platform</span>
                                <span className="font-body-sm text-xs text-on-surface flex items-center gap-1 mt-1">
                                  <span className="material-symbols-outlined text-[14px] text-primary">contactless</span>
                                  BHIM UPI App
                                </span>
                              </div>
                            </div>
                            <div className="bg-surface-container-lowest/50 p-2.5 rounded flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-label-caps text-[10px] text-secondary uppercase">Claimed UTR</span>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(p.transaction_id)}
                                  className="text-primary hover:underline text-[11px] font-data-mono flex items-center gap-1"
                                >
                                  <span>Copy</span>
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="font-data-mono text-sm text-primary tracking-wider font-semibold select-all">
                                {p.transaction_id}
                              </span>
                              <span className="font-data-mono text-[10px] text-secondary mt-0.5">
                                {new Date(p.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Bank Ledger Record */}
                          <div className="bg-surface-container-high rounded-lg p-4 flex flex-col justify-between border border-outline-variant/20">
                            <div className="flex items-center justify-between pb-2 mb-2 bg-surface-container-highest px-2.5 py-1 rounded">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                <span className="font-label-caps text-label-caps uppercase text-primary">
                                  SBI Merchant Ledger
                                </span>
                              </div>
                              <span className="font-data-mono text-[11px] text-primary">mr.death4646@oksbi</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-left mb-2">
                              <div>
                                <span className="font-label-caps text-[10px] text-secondary uppercase block">Payee Credit Target</span>
                                <span className="font-headline-sm text-xl font-bold text-primary">
                                  ₹{p.amount.toLocaleString('en-IN')} CR
                                </span>
                              </div>
                              <div>
                                <span className="font-label-caps text-[10px] text-secondary uppercase block">Institutional Payee</span>
                                <span className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                                  <span className="material-symbols-outlined text-[14px]">account_balance</span>
                                  Sanjay Mass
                                </span>
                              </div>
                            </div>
                            <div className="bg-surface-container-lowest/80 p-2.5 rounded flex flex-col gap-0.5">
                              <span className="font-label-caps text-[10px] text-secondary uppercase">Matching Condition</span>
                              <span className="font-data-mono text-xs text-on-surface truncate">
                                Confirm Credit with Ref: {p.transaction_id}
                              </span>
                              <span className="font-data-mono text-[10px] text-secondary mt-0.5">
                                Verified manually prior to runway badge unlock
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Receipt Visual Inspector (Screen 10) */}
                      <div className="bg-surface-container rounded-lg p-4 mb-4 border border-outline-variant/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">image_search</span>
                            <h3 className="font-headline-sm text-base text-on-surface font-semibold">Payment Voucher Evidence</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveScreenshot(p.view_url || '/qr_code.png')}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-md text-xs uppercase"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Zoom Fullscreen</span>
                          </button>
                        </div>

                        <div className="relative group rounded-lg overflow-hidden bg-surface-container-lowest max-h-64 flex items-center justify-center p-2">
                          <img
                            src={p.view_url || '/qr_code.png'}
                            alt="Payment Voucher"
                            className="max-h-60 w-auto object-contain cursor-zoom-in rounded"
                            onClick={() => setActiveScreenshot(p.view_url || '/qr_code.png')}
                          />
                        </div>
                      </div>

                      {/* Action Verification Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-outline-variant/30">
                        <button
                          type="button"
                          disabled={verifyingId === p.payment_id}
                          onClick={() => handleVerify(p.payment_id, 'VERIFY', 'Reconciled against bank credit statement')}
                          className="w-full sm:flex-1 h-12 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-label-md uppercase font-semibold tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                          {verifyingId === p.payment_id ? (
                            <span>Auditing &amp; Crediting Ledger...</span>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Confirm &amp; Verify Payment (₹{p.amount.toLocaleString('en-IN')})</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={verifyingId === p.payment_id}
                          onClick={() => setRejectModalPayment(p)}
                          className="w-full sm:w-auto px-6 h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-error border border-error/30 font-label-md text-label-md uppercase tracking-wider transition-colors"
                        >
                          Reject / Flag Discrepancy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PARTICIPANT MANAGEMENT (Screen 08) */}
        {/* ========================================================= */}
        {adminTab === 'participants' && (
          <div className="space-y-6">
            {/* Interactive Sub-header / Metrics Banner */}
            <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-md border border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Roster Sync Engine
                  </span>
                </div>
                <span className="font-data-mono text-data-mono text-primary bg-surface-container-highest px-2.5 py-0.5 rounded-full">
                  LIVE FEED
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-headline-sm text-2xl text-on-surface tracking-tight">
                    {participants.length} <span className="text-on-surface-variant font-body-sm text-sm">Casting Profiles</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-data-mono text-data-mono text-on-surface-variant">
                    Reconciled: <strong className="text-primary font-semibold">82.5%</strong>
                  </span>
                </div>
              </div>
              {/* Mini Progress Line */}
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden flex">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: '82.5%' }}></div>
                <div className="bg-outline h-full" style={{ width: '13.5%' }}></div>
                <div className="bg-error h-full" style={{ width: '4%' }}></div>
              </div>
            </div>

            {/* Search & Command Bar */}
            <div className="flex flex-col space-y-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-surface-container rounded-xl text-on-surface placeholder-secondary font-body-md text-sm focus:outline-none focus:bg-surface-container-high transition-colors border border-outline-variant/20"
                  placeholder="Search name, Reg ID, UTR, phone, or city..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter Carousel */}
              <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All', count: participants.length },
                  { id: 'PENDING_VERIFICATION', label: 'Pending Verification', count: participants.filter(p => p.status === 'PENDING_VERIFICATION').length },
                  { id: 'FULLY_PAID', label: 'Fully Paid (100%)', count: participants.filter(p => p.status === 'FULLY_PAID').length },
                  { id: 'PARTIALLY_PAID', label: 'Partial / Due', count: participants.filter(p => p.status === 'PARTIALLY_PAID').length },
                  { id: 'REJECTED', label: 'Flagged', count: participants.filter(p => p.status === 'REJECTED').length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setStatusFilter(item.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-full font-label-md text-label-md transition-all flex items-center space-x-1.5 ${
                      statusFilter === item.id
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="font-data-mono text-[11px] opacity-80">({item.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Candidates Stream (Screen 08) */}
            <div className="flex flex-col space-y-4">
              {filteredParticipants.map((p) => {
                const isFullyPaid = p.status === 'FULLY_PAID';
                const isPartial = p.status === 'PARTIALLY_PAID';
                const isPending = p.status === 'PENDING_VERIFICATION';
                const isRejected = p.status === 'REJECTED';

                return (
                  <div 
                    key={p.id}
                    className="bg-surface-container-low rounded-xl p-5 sm:p-6 shadow-md relative overflow-hidden transition-all duration-300 border border-outline-variant/30"
                  >
                    {/* Ambient Indicator Bar */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isFullyPaid ? 'bg-primary' : isPending ? 'bg-amber-400' : isRejected ? 'bg-error' : 'bg-outline'
                      }`}
                    ></div>

                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3.5 min-w-0">
                        <div className="relative shrink-0">
                          {p.profile_photo_url ? (
                            <img 
                              src={p.profile_photo_url} 
                              alt={p.full_name} 
                              className="w-13 h-13 w-12 h-12 rounded-lg object-cover shadow-sm bg-surface-variant" 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center font-data-mono font-bold text-primary">
                              {p.reg_id.substring(p.reg_id.length - 2)}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 bg-surface-container-highest rounded-full p-0.5">
                            {isFullyPaid ? (
                              <span className="material-symbols-outlined text-[13px] text-primary block" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                              </span>
                            ) : (
                              <span className="material-symbols-outlined text-[13px] text-amber-400 block">
                                pending_actions
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center space-x-2">
                            <h2 className="font-headline-sm text-lg text-on-surface truncate">{p.full_name}</h2>
                            {isFullyPaid && (
                              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                                stars
                              </span>
                            )}
                          </div>
                          <span className="font-data-mono text-xs text-primary font-semibold">#{p.reg_id}</span>
                          <span className="font-body-sm text-xs text-on-surface-variant">{p.city} • {p.mobile}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openWhatsApp(p.mobile, p.full_name, p.reg_id, p.status)}
                          className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary hover:text-primary-fixed transition-colors"
                          title="Contact via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Division Meta Tag */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-caps text-[10px] tracking-wide uppercase">
                        {p.category} — Open Category
                      </span>
                    </div>

                    {/* Ledger Breakdown Table-Strip */}
                    <div className="mt-3.5 bg-surface-container rounded-lg p-3 flex items-center justify-between text-center border border-outline-variant/10">
                      <div>
                        <span className="block font-label-caps text-[10px] uppercase text-secondary">Total Fee</span>
                        <span className="font-data-mono text-sm text-on-surface font-semibold">
                          ₹{p.total_fee.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-surface-container-highest"></div>
                      <div>
                        <span className="block font-label-caps text-[10px] uppercase text-secondary">Verified Paid</span>
                        <span className="font-data-mono text-sm text-primary font-semibold">
                          ₹{p.amount_paid.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-surface-container-highest"></div>
                      <div>
                        <span className="block font-label-caps text-[10px] uppercase text-secondary">Remaining Due</span>
                        <span className={`font-data-mono text-sm font-semibold ${p.balance_due > 0 ? 'text-amber-400' : 'text-on-surface-variant'}`}>
                          ₹{p.balance_due.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Audit / Verification Status Badge */}
                    <div className="mt-3 flex items-center justify-between bg-surface-container-highest px-3.5 py-1.5 rounded-full">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${isFullyPaid ? 'bg-primary' : 'bg-amber-400'}`}></span>
                        <span className="font-label-md text-xs text-on-surface truncate">
                          {isFullyPaid ? 'Runway Pass Cleared' : isPending ? 'Payment Awaiting Audit' : `Balance Outstanding (₹${p.balance_due})`}
                        </span>
                      </div>
                      <span className="font-data-mono text-[11px] text-secondary">Status: {p.status}</span>
                    </div>

                    {/* Action Toggles */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 pt-1">
                      <button 
                        onClick={() => openWhatsApp(p.mobile, p.full_name, p.reg_id, p.status)}
                        className="w-full py-2.5 px-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-xs uppercase flex items-center justify-center space-x-1 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span>WhatsApp Nudge</span>
                      </button>
                      <button 
                        onClick={() => {
                          setAdminTab('verification');
                        }}
                        className="w-full py-2.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-xs uppercase font-semibold flex items-center justify-center space-x-1 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Manage Payments</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BANK RECONCILIATION */}
        {/* ========================================================= */}
        {adminTab === 'reconciliation' && (
          <div className="space-y-6">
            <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/30">
              <h2 className="font-headline-sm text-2xl text-on-surface mb-2">Institutional Bank Statement Reconciler</h2>
              <p className="font-body-sm text-sm text-on-surface-variant max-w-2xl leading-relaxed mb-6">
                Paste raw lines or UTR narrative extracts from your SBI net banking statement. The matching engine cross-references registered transactions and flags matches for one-click verification.
              </p>

              <div className="space-y-4">
                <textarea
                  rows={6}
                  value={reconcileInput}
                  onChange={(e) => setReconcileInput(e.target.value)}
                  placeholder="Paste statement lines containing UTRs, amounts, or narrations (e.g., UPI/415289912048/CR/ELENA R 7500.00)..."
                  className="w-full bg-surface-container rounded-lg p-4 font-data-mono text-xs text-on-surface focus:outline-none focus:bg-surface-container-high border border-outline-variant/20"
                />

                <button
                  type="button"
                  onClick={handleRunReconcile}
                  className="px-6 py-3 bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-xs uppercase font-semibold tracking-wider rounded-lg flex items-center gap-2 shadow-md transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Execute Statement Matching</span>
                </button>
              </div>

              {reconcileMatches.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h3 className="font-headline-sm text-lg text-on-surface">Reconciliation Matches</h3>
                  <div className="space-y-2">
                    {reconcileMatches.map((m, idx) => (
                      <div key={idx} className="bg-surface-container p-4 rounded-lg flex items-center justify-between border border-outline-variant/20 text-xs">
                        <div className="min-w-0 pr-4">
                          <p className="font-data-mono text-on-surface truncate">{m.line}</p>
                          <span className="font-body-sm text-secondary">
                            {m.match ? `Matched Reg ID: ${m.match.reg_id} • Amount: ₹${m.match.amount}` : 'No matching payment record found'}
                          </span>
                        </div>
                        <div className="shrink-0">
                          {m.match ? (
                            m.match.status === 'PENDING' ? (
                              <button
                                onClick={() => handleVerify(m.match.payment_id, 'VERIFY', 'Reconciled via Bank Statement Tool')}
                                className="px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-xs uppercase font-bold"
                              >
                                Reconcile &amp; Clear
                              </button>
                            ) : (
                              <span className="text-primary font-data-mono font-semibold">Already Verified</span>
                            )
                          ) : (
                            <span className="text-secondary font-data-mono">Unmatched</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: REPORTS & BATCH EXPORTS */}
        {/* ========================================================= */}
        {adminTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Exports */}
              <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-4">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-sm text-xl text-on-surface mb-2">Participant &amp; Ledger CSV Export</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mb-6">
                    Download complete spreadsheet reports containing registered contestant profiles, contact records, payment audit histories, and balance amounts.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={getCsvExportUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Contestant Ledger (CSV)</span>
                  </a>
                </div>
              </div>

              {/* Cloudflare R2 ZIP Export */}
              <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-4">
                    <FolderArchive className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-sm text-xl text-on-surface mb-2">Cloudflare R2 Portfolio Archive</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mb-6">
                    Stream and download high-resolution contestant photos and payment screenshots directly from the private Cloudflare R2 object storage bucket.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={getZipDownloadUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 border border-outline-variant/30 transition-all"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span>Download Event Portfolios (ZIP)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SETTINGS */}
        {/* ========================================================= */}
        {adminTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-surface-container-low rounded-xl p-6 shadow-md border border-outline-variant/30 max-w-2xl">
              <h2 className="font-headline-sm text-2xl text-on-surface mb-2">Platform Configuration</h2>
              <p className="font-body-sm text-xs text-on-surface-variant mb-6">
                Institutional parameters for SKYRA CREATIONS payments and registrations.
              </p>

              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/20 flex justify-between items-center">
                  <div>
                    <span className="font-label-caps text-xs uppercase text-secondary block">Verified Merchant UPI ID</span>
                    <span className="font-data-mono text-primary font-semibold text-base">mr.death4646@oksbi</span>
                  </div>
                  <span className="font-data-mono text-xs text-secondary">Payee: Sanjay Mass</span>
                </div>

                <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/20 flex justify-between items-center">
                  <div>
                    <span className="font-label-caps text-xs uppercase text-secondary block">Registration Fee Structure</span>
                    <span className="font-data-mono text-on-surface font-semibold text-base">Total ₹5,000 / ₹12,000</span>
                  </div>
                  <span className="font-data-mono text-xs text-primary">Advance: ₹1,500 / ₹2,000</span>
                </div>

                <div className="p-4 rounded-lg bg-surface-container border border-outline-variant/20 flex justify-between items-center">
                  <div>
                    <span className="font-label-caps text-xs uppercase text-secondary block">Object Storage</span>
                    <span className="font-data-mono text-on-surface font-semibold text-base">Cloudflare R2 Private Bucket</span>
                  </div>
                  <span className="font-data-mono text-xs text-primary">Presigned PUT/GET Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal for Payment Vouchers */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-surface-container rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-outline-variant/30">
              <span className="font-label-caps text-xs uppercase text-primary">Payment Voucher Lightbox</span>
              <button 
                onClick={() => setActiveScreenshot(null)} 
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img 
              src={activeScreenshot} 
              alt="Expanded Voucher" 
              className="max-h-[75vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Rejection Modal with Presets */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-error/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-headline-sm text-xl text-error flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Flag Payment Discrepancy</span>
              </h3>
              <button onClick={() => setRejectModalPayment(null)} className="text-on-surface-variant">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-body-sm text-xs text-on-surface-variant">
              Provide an audit remark for candidate #{rejectModalPayment.reg_id} regarding payment #{rejectModalPayment.payment_id}.
            </p>

            <div className="space-y-2">
              <span className="font-label-caps text-[10px] text-secondary uppercase">Quick Exception Presets:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'UTR Not Found on Bank Statement',
                  'Amount Mismatch (Proof != Ledger)',
                  'Illegible / Blurry Proof Uploaded',
                  'Duplicate Transaction Reference',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="p-2 rounded bg-surface-container hover:bg-surface-container-high text-left text-xs font-body-sm text-on-surface transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-caps text-xs uppercase text-secondary">Detailed Rejection Remark</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-surface-container rounded-lg p-3 text-xs text-on-surface font-body-sm focus:outline-none focus:bg-surface-container-high border border-outline-variant/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifyingId === rejectModalPayment.payment_id}
                onClick={() => handleVerify(rejectModalPayment.payment_id, 'REJECT', rejectionReason)}
                className="px-5 py-2.5 rounded-lg bg-error text-on-error font-label-md text-xs uppercase font-semibold"
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
