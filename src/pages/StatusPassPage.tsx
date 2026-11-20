import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  Printer, 
  Sparkles, 
  XCircle,
  ShieldCheck,
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';
import { lookupParticipant } from '../lib/api';
import { Participant } from '../types/index';

interface StatusPassPageProps {
  initialRegId?: string;
  setActiveTab: (tab: string) => void;
  setBalanceRegId?: (id: string) => void;
}

export default function StatusPassPage({ initialRegId, setActiveTab, setBalanceRegId }: StatusPassPageProps) {
  const [query, setQuery] = useState(initialRegId || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [participant, setParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (initialRegId) {
      handleSearch(initialRegId);
    }
  }, [initialRegId]);

  const handleSearch = async (overrideQ?: string) => {
    const q = (overrideQ || query).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const data = await lookupParticipant(q);
      setParticipant(data);
    } catch (err: any) {
      setParticipant(null);
      setErrorMsg(err.message || `No registration record found matching "${q}". Please check your Registration ID.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 font-data-mono">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <span>Fully Cleared &amp; Accredited</span>
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-data-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Advance Verified (Balance Due)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-error/15 text-error border border-error/30 font-data-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>Verification Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant border border-outline-variant/30 font-data-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Audit In Progress</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 text-xs uppercase tracking-widest text-primary mb-3 font-data-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accreditation &amp; Self-Service</span>
        </div>
        <h1 className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg font-normal text-on-surface mb-3 tracking-tight">
          PARTICIPANT PASS &amp; STATUS
        </h1>
        <p className="font-body-sm text-sm text-on-surface-variant max-w-xl mx-auto font-light leading-relaxed">
          Search with your Registration ID or email to view real-time bank verification status, balance history, and access your digital runway pass.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Enter Registration ID (e.g. SC-2026-1001) or Email Address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-full bg-surface-container border border-outline-variant/20 rounded-lg pl-10 pr-4 py-3 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high font-data-mono text-sm"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all shrink-0 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search Record</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-body-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Participant Profile and Pass Section */}
      {participant && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Overview Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-outline-variant/20 gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="font-headline-sm text-2xl sm:text-3xl font-normal text-on-surface">
                    {participant.full_name}
                  </h2>
                  <span className="font-data-mono text-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary border border-outline-variant/30">
                    {participant.reg_id}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  {participant.category} • {participant.city} • Registered on {new Date(participant.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                {getStatusBadge(participant.status)}
              </div>
            </div>

            {/* Financial Overview Tiles */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 text-center">
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                <span className="font-label-caps text-[11px] uppercase text-secondary block mb-1">Total Fee</span>
                <span className="font-headline-sm text-base sm:text-xl font-bold text-on-surface tabular-nums">
                  ₹{participant.total_fee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/20">
                <span className="font-label-caps text-[11px] uppercase text-secondary block mb-1">Verified Paid</span>
                <span className="font-headline-sm text-base sm:text-xl font-bold text-primary tabular-nums">
                  ₹{participant.amount_paid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-surface-container-high p-4 rounded-xl border border-primary/30 shadow-sm">
                <span className="font-label-caps text-[11px] uppercase text-primary font-semibold block mb-1">Balance Due</span>
                <span className="font-headline-sm text-base sm:text-xl font-bold text-primary tabular-nums">
                  ₹{participant.balance_due.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {participant.balance_due > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="font-body-sm text-xs text-on-surface-variant">
                  Outstanding balance of <strong className="text-primary tabular-nums">₹{participant.balance_due.toLocaleString('en-IN')}</strong>. Complete settlement to finalize credentials.
                </div>
                <button
                  onClick={() => {
                    if (setBalanceRegId) setBalanceRegId(participant.reg_id);
                    setActiveTab('balance');
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shrink-0 shadow-md flex items-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Balance</span>
                </button>
              </div>
            )}
          </div>

          {/* Luxury Digital Pass */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Background luxury watermark */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none select-none font-headline-lg text-[220px] text-white">
              SC
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-outline-variant/30 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
                  <span className="font-headline-sm text-lg text-primary font-bold">SC</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-xl text-on-surface tracking-wider">SKYRA CREATIONS</h3>
                  <span className="font-data-mono text-[10px] text-primary uppercase tracking-widest block">
                    Official Runway Pass • Haute Couture 2026
                  </span>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs uppercase font-label-md tracking-wider flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-8">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="font-label-caps text-[10px] uppercase tracking-wider text-secondary block">Contestant Name</span>
                  <span className="font-headline-sm text-2xl sm:text-3xl text-on-surface font-normal block">{participant.full_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-data-mono">
                  <div>
                    <span className="text-secondary uppercase block text-[10px]">Registration ID</span>
                    <span className="text-primary font-bold text-sm">{participant.reg_id}</span>
                  </div>
                  <div>
                    <span className="text-secondary uppercase block text-[10px]">Category</span>
                    <span className="text-on-surface font-medium">{participant.category}</span>
                  </div>
                  <div>
                    <span className="text-secondary uppercase block text-[10px]">City</span>
                    <span className="text-on-surface font-medium">{participant.city}</span>
                  </div>
                  <div>
                    <span className="text-secondary uppercase block text-[10px]">Accreditation</span>
                    <span className="text-primary font-medium">Stage Ready</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Badge */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-lg mx-auto">
                <QRCodeSVG
                  value={`https://shyra-creations.vercel.app/verify/${participant.reg_id}`}
                  size={140}
                  level="H"
                />
                <span className="text-[10px] text-black font-data-mono font-bold mt-2 tracking-wider">
                  {participant.reg_id}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-data-mono text-secondary">
              <span>Security Hash: Verified Database Record</span>
              <span>Valid with Photo ID</span>
            </div>
          </div>

          {/* Payment History & Timeline */}
          {participant.payments && participant.payments.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-headline-sm text-xl text-on-surface mb-6">Payment History &amp; Audit Trail</h3>
              
              <div className="space-y-3">
                {participant.payments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="bg-surface-container border border-outline-variant/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-data-mono text-xs text-primary uppercase">
                          {p.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Advance' : 'Balance Installment'}
                        </span>
                        <span className="text-secondary">•</span>
                        <span className="text-xs text-secondary font-data-mono">{p.payment_id}</span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant font-data-mono">
                        UTR: <strong className="text-on-surface">{p.transaction_id}</strong> • Submitted: {new Date(p.created_at).toLocaleString()}
                      </p>
                      {p.rejection_reason && (
                        <p className="text-xs text-error mt-1 font-body-sm">
                          Reason: {p.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 sm:text-right">
                      <div className="text-right">
                        <span className="font-headline-sm text-base font-bold text-on-surface tabular-nums block">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-data-mono uppercase tracking-wider block ${
                          p.status === 'VERIFIED'
                            ? 'text-primary'
                            : p.status === 'REJECTED'
                            ? 'text-error'
                            : 'text-amber-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
