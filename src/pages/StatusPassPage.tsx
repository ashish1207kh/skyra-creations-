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
  FileText,
  BadgeCheck
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
    if (!q) {
      setErrorMsg('Please enter your Registration ID or registered email address.');
      return;
    }

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

  // Determine Timeline Progress Stage (1 through 4)
  const getTimelineStage = (p: Participant) => {
    if (p.status === 'FULLY_PAID') return 4;
    if (p.status === 'PARTIALLY_PAID') return 3;
    if (p.status === 'REJECTED') return 2;
    return 2; // PENDING_VERIFICATION
  };

  const currentStage = participant ? getTimelineStage(participant) : 1;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Participant Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
          Track Your Registration
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto font-medium">
          Stay updated on your SKYRA CREATIONS Runway Show 2026 registration and payment status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
        <p className="text-xs sm:text-sm text-zinc-400 mb-4">
          Enter your registration ID or registered email address to view your registration progress.
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Registration ID (e.g. SC-2026-1001) or Email Address"
              className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 font-mono tracking-wide"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
          >
            {loading ? (
              <span>Checking...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Check Registration Status</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Participant Results */}
      {participant && (
        <div className="space-y-8 animate-fadeIn">
          {/* 5.1 REGISTRATION STATUS TIMELINE */}
          <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-800 gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block mb-1">
                  Participant Overview
                </span>
                <h2 className="font-serif text-2xl font-bold text-white">
                  {participant.full_name}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Registration ID: <span className="font-mono text-amber-300">{participant.reg_id}</span> • Category: <span className="text-zinc-200">{participant.category}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-center">
                <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                  participant.status === 'FULLY_PAID'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : participant.status === 'PARTIALLY_PAID'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : participant.status === 'REJECTED'
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {participant.status === 'FULLY_PAID'
                    ? 'Confirmed (Fully Paid)'
                    : participant.status === 'PARTIALLY_PAID'
                    ? 'Confirmed (Partially Paid)'
                    : participant.status === 'REJECTED'
                    ? 'Verification Rejected'
                    : 'Under Review'}
                </span>
              </div>
            </div>

            {/* 4 Stage Timeline Visual */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Verification &amp; Pass Progression
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Stage 1 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStage >= 1
                    ? 'bg-zinc-900/80 border-amber-500/40 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <CheckCircle2 className={`w-4 h-4 ${currentStage >= 1 ? 'text-amber-400' : 'text-zinc-600'}`} />
                    <span>Stage 1</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Registration Received</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Your registration has been successfully submitted.</p>
                </div>

                {/* Stage 2 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStage >= 2 && participant.status !== 'REJECTED'
                    ? 'bg-zinc-900/80 border-amber-500/40 text-white'
                    : participant.status === 'REJECTED'
                    ? 'bg-red-950/30 border-red-500/40 text-red-300'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    {participant.status === 'REJECTED' ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Clock className={`w-4 h-4 ${currentStage >= 2 ? 'text-amber-400' : 'text-zinc-600'}`} />
                    )}
                    <span>Stage 2</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Verification in Progress</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Our team is reviewing your registration information and payment proof.</p>
                </div>

                {/* Stage 3 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStage >= 3
                    ? 'bg-zinc-900/80 border-amber-500/40 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <BadgeCheck className={`w-4 h-4 ${currentStage >= 3 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span>Stage 3</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Registration Confirmed</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Your registration has been approved.</p>
                </div>

                {/* Stage 4 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStage >= 4
                    ? 'bg-zinc-900/80 border-emerald-500/40 text-white'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <Sparkles className={`w-4 h-4 ${currentStage >= 4 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span>Stage 4</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Digital Entry Pass Available</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Your digital pass is ready to view and print, subject to the applicable event access requirements.</p>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#0a0c12] border border-zinc-800 rounded-xl p-4">
                <span className="text-xs text-zinc-400 block mb-1">Total Event Fee</span>
                <span className="text-xl font-bold text-white">₹{participant.total_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#0a0c12] border border-emerald-500/20 rounded-xl p-4">
                <span className="text-xs text-emerald-400 block mb-1">Verified Amount Paid</span>
                <span className="text-xl font-bold text-emerald-400">₹{participant.amount_paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#0a0c12] border border-amber-500/20 rounded-xl p-4">
                <span className="text-xs text-amber-400 block mb-1">Outstanding Balance</span>
                <span className="text-xl font-bold text-amber-400">₹{participant.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Outstanding Balance Banner with Action */}
            {participant.balance_due > 0 && participant.status !== 'REJECTED' && (
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-300">
                    You have an outstanding balance of ₹{participant.balance_due.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Clear your balance before the final event rehearsal to secure all-access privileges.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (setBalanceRegId) setBalanceRegId(participant.reg_id);
                    setActiveTab('balance');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shrink-0 flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Remaining Balance</span>
                </button>
              </div>
            )}
          </div>

          {/* 5.2 OFFICIAL RUNWAY SHOW DIGITAL PASS CARD */}
          {(participant.status === 'FULLY_PAID' || participant.status === 'PARTIALLY_PAID') && (
            <div className="relative overflow-hidden bg-gradient-to-br from-[#191e2b] via-[#12151f] to-[#0c0e14] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl print:border-black print:bg-white print:text-black">
              {/* Pass Card Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-5 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-xl bg-black border border-amber-500/40 p-1.5 flex items-center justify-center shadow-lg">
                    <img src="/logo.png" alt="Skyra Creations Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-xl tracking-wider">
                      SKYRA CREATIONS
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                      RUNWAY SHOW 2026 — Official Runway Entry Pass
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors print:hidden border border-zinc-700"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Entry Pass</span>
                </button>
              </div>

              {/* Pass Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2 space-y-4 text-sm">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Participant Name</span>
                    <strong className="text-xl sm:text-2xl text-white font-serif tracking-wide block">
                      {participant.full_name}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Registration ID</span>
                      <strong className="font-mono text-base text-amber-300">{participant.reg_id}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Category</span>
                      <strong className="text-zinc-200 text-base">{participant.category}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">City</span>
                      <strong className="text-zinc-200 text-base">{participant.city || 'Verified Participant'}</strong>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Pass Status</span>
                      <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                        participant.status === 'FULLY_PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {participant.status === 'FULLY_PAID'
                          ? 'FULLY PAID — ALL ACCESS'
                          : `VERIFIED — PARTIAL PAYMENT (Due: ₹${participant.balance_due})`}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800 leading-relaxed">
                    Notice: Venue entry and backstage accreditation are subject to verified photo identification and compliance with event rehearsal guidelines.
                  </p>
                </div>

                {/* Scannable Opaque QR Code */}
                <div className="text-center p-6 bg-black/60 rounded-2xl border border-amber-500/30 flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg mb-3">
                    <QRCodeSVG
                      value={participant.pass_token || `SKYRA-PASS-${participant.reg_id}`}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                    Official Check-in Token
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                    {participant.pass_token ? participant.pass_token.slice(0, 18) + '...' : participant.reg_id}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
