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
  User
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
      setErrorMsg(err.message || `No registration found matching "${q}".`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_PAID':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-success/15 text-status-success border border-status-success/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Cleared & Accredited</span>
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-pending/15 text-status-pending border border-status-pending/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Advance Verified (Balance Pending)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-rejected/15 text-status-rejected border border-status-rejected/30 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            <span>Verification Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-status-info/15 text-status-info border border-status-info/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Verification In Progress</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-charcoal-card border border-charcoal-border text-xs uppercase tracking-widest text-lime-accent mb-3 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accreditation & Self-Service</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-ivory mb-3">
          PARTICIPANT PASS & STATUS
        </h1>
        <p className="text-charcoal-muted text-sm max-w-xl mx-auto font-light leading-relaxed">
          Search with your Registration ID or email to view real-time bank verification status, balance history, and access your digital runway pass.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Enter Registration ID (e.g. SC-2026-1001) or Email Address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent font-mono text-sm"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-lime-accent hover:bg-[#c9f556] text-charcoal font-semibold rounded-btn text-xs uppercase tracking-wider transition-all shrink-0 disabled:opacity-50 shadow-lime-glow"
          >
            {loading ? 'Searching...' : 'Search Record'}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 rounded-card bg-status-rejected/10 border border-status-rejected/30 text-status-rejected text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Participant Profile and Pass Section */}
      {participant && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Overview Card */}
          <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-border gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-ivory">{participant.full_name}</h2>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-charcoal-surface text-lime-accent border border-charcoal-border">
                    {participant.reg_id}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted">
                  {participant.category} • {participant.city} • Registered on {new Date(participant.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                {getStatusBadge(participant.status)}
              </div>
            </div>

            {/* Financial Overview Tiles */}
            <div className="grid grid-cols-3 gap-4 pt-6 text-center">
              <div className="bg-[#101213] p-4 rounded-card border border-charcoal-border">
                <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Total Fee</span>
                <span className="text-base sm:text-xl font-bold text-ivory tabular-nums">
                  ₹{participant.total_fee.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-[#101213] p-4 rounded-card border border-charcoal-border">
                <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Verified Paid</span>
                <span className="text-base sm:text-xl font-bold text-status-success tabular-nums">
                  ₹{participant.amount_paid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-charcoal-surface p-4 rounded-card border border-lime-accent/40 shadow-sm">
                <span className="text-[11px] font-mono uppercase text-lime-accent font-semibold block mb-1">Balance Due</span>
                <span className="text-base sm:text-xl font-bold text-lime-accent tabular-nums">
                  ₹{participant.balance_due.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {participant.balance_due > 0 && (
              <div className="mt-6 p-4 rounded-card bg-charcoal-surface border border-charcoal-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-charcoal-muted">
                  You have an outstanding balance of <strong className="text-lime-accent tabular-nums">₹{participant.balance_due.toLocaleString('en-IN')}</strong>. Complete payment to finalize accreditation.
                </div>
                <button
                  onClick={() => {
                    if (setBalanceRegId) setBalanceRegId(participant.reg_id);
                    setActiveTab('balance');
                  }}
                  className="px-4 py-2 bg-lime-accent hover:bg-[#c9f556] text-charcoal font-semibold rounded-btn text-xs uppercase tracking-wider transition-all shrink-0 shadow-lime-glow flex items-center space-x-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Balance</span>
                </button>
              </div>
            )}
          </div>

          {/* Luxury Digital Pass */}
          <div className="bg-[#101213] border border-charcoal-border rounded-section p-8 sm:p-10 shadow-luxury relative overflow-hidden">
            {/* Background luxury watermark */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none select-none font-editorial text-[200px] text-white">
              SC
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-charcoal-border gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-btn bg-charcoal-surface border border-charcoal-border flex items-center justify-center">
                  <span className="font-editorial text-lg text-lime-accent font-bold">SC</span>
                </div>
                <div>
                  <h3 className="font-editorial text-xl text-ivory tracking-wider">SKYRA CREATIONS</h3>
                  <span className="text-[10px] font-mono text-lime-accent uppercase tracking-widest block">
                    Official Runway Pass • 2026 Edition
                  </span>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-btn bg-charcoal-surface border border-charcoal-border text-charcoal-muted hover:text-ivory hover:border-lime-accent text-xs uppercase font-mono tracking-wider flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save Pass</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-8">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block">Contestant Name</span>
                  <span className="font-editorial text-2xl sm:text-3xl text-ivory font-normal block">{participant.full_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-charcoal-muted uppercase block">Registration ID</span>
                    <span className="text-lime-accent font-bold text-sm">{participant.reg_id}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-muted uppercase block">Category</span>
                    <span className="text-ivory font-medium">{participant.category}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-muted uppercase block">City</span>
                    <span className="text-ivory font-medium">{participant.city}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-muted uppercase block">Accreditation</span>
                    <span className="text-status-success font-medium">Stage Ready</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Badge */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-card shadow-lg mx-auto">
                <QRCodeSVG
                  value={`https://skyra-creations.vercel.app/verify/${participant.reg_id}`}
                  size={140}
                  level="H"
                />
                <span className="text-[10px] text-black font-mono font-bold mt-2 tracking-wider">
                  {participant.reg_id}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal-border flex items-center justify-between text-[11px] font-mono text-charcoal-muted">
              <span>Security Hash: Verified Database Record</span>
              <span>Valid with Government Photo ID</span>
            </div>
          </div>

          {/* Payment History & Timeline */}
          {participant.payments && participant.payments.length > 0 && (
            <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
              <h3 className="font-editorial text-2xl text-ivory mb-6">Payment History & Verification Trail</h3>
              
              <div className="space-y-4">
                {participant.payments.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="bg-[#101213] border border-charcoal-border rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-xs text-lime-accent uppercase">
                          {p.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Advance' : 'Balance Installment'}
                        </span>
                        <span className="text-charcoal-muted">•</span>
                        <span className="text-xs text-charcoal-muted font-mono">{p.payment_id}</span>
                      </div>
                      <p className="text-xs text-charcoal-muted font-mono">
                        UTR: <strong className="text-ivory">{p.transaction_id}</strong> • Submitted: {new Date(p.created_at).toLocaleString()}
                      </p>
                      {p.rejection_reason && (
                        <p className="text-xs text-status-rejected mt-1">
                          Reason: {p.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 sm:text-right">
                      <div className="text-right">
                        <span className="text-base font-bold text-ivory tabular-nums block">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                          p.status === 'VERIFIED'
                            ? 'text-status-success'
                            : p.status === 'REJECTED'
                            ? 'text-status-rejected'
                            : 'text-status-pending'
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
