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
  BadgeCheck,
  MapPin,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { lookupParticipant } from '../lib/api';
import { Participant } from '../types/index';
import MagneticButton from '../components/MagneticButton';

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
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 text-[#C6FF00] font-mono-editorial text-[10px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PARTICIPANT CREDENTIAL DESK</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.05]">
          TRACK REGISTRATION.
        </h1>
        <p className="text-sm sm:text-base text-[#BFC3C7] font-light leading-relaxed">
          Check your live verification status, download your verified Runway Pass, or view outstanding balance records.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl space-y-4">
        <p className="font-mono-editorial text-[11px] text-[#BFC3C7] uppercase tracking-wider">
          ENTER REGISTRATION ID OR REGISTERED EMAIL
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
              placeholder="e.g. SC-2026-1001 or name@domain.com"
              className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] font-mono tracking-wide"
            />
          </div>
          <MagneticButton
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 active:scale-98"
          >
            {loading ? (
              <span>VERIFYING...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>CHECK STATUS &amp; PASS</span>
              </>
            )}
          </MagneticButton>
        </form>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-sm text-xs text-red-300 flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Prominent Venue & Schedule Notice */}
      <div className="bg-[#0b0c10] border border-[#C6FF00]/40 rounded-sm p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center shrink-0 text-[#C6FF00] mt-0.5 shadow">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-editorial text-[11px] font-bold uppercase tracking-widest text-[#C6FF00]">
                VENUE POLICY &amp; REPORTING DATES
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white font-mono-editorial text-[10px] uppercase tracking-wider">
                Chennai (City Center)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white leading-relaxed font-light">
              <strong className="font-medium">Event Location:</strong> Central Chennai prime city auditorium (never remote outskirts).
            </p>
            <p className="text-xs sm:text-sm text-[#BFC3C7] leading-relaxed font-light">
              <strong className="font-medium text-white">Venue Release:</strong> Exact venue address and show timings are <strong className="text-[#C6FF00]">announced 10 days before the show</strong> and communicated directly via registered WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Participant Results */}
      {participant && (
        <div className="space-y-8 animate-fadeIn">
          {/* 5.1 REGISTRATION STATUS TIMELINE */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-3">
              <div>
                <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#C6FF00] font-bold block mb-1">
                  OFFICIAL CANDIDATE FILE
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {participant.full_name}
                </h2>
                <p className="text-xs text-[#BFC3C7] font-mono mt-0.5">
                  ID: <span className="text-[#C6FF00] font-bold">{participant.reg_id}</span> • Category: <span className="text-white">{participant.category}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-center">
                <span className={`font-mono-editorial text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm border ${
                  participant.status === 'FULLY_PAID'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : participant.status === 'PARTIALLY_PAID'
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/30'
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
              <h3 className="font-mono-editorial text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                PIPELINE PROGRESSION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono-editorial">
                {/* Stage 1 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  currentStage >= 1
                    ? 'bg-[#080808] border-[#C6FF00]/40 text-white'
                    : 'bg-[#080808] border-white/10 text-zinc-600'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${currentStage >= 1 ? 'text-[#C6FF00]' : 'text-zinc-600'}`} />
                    <span>01 // SUBMITTED</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Registration Received</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans font-light">Details and payment token logged.</p>
                </div>

                {/* Stage 2 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  currentStage >= 2 && participant.status !== 'REJECTED'
                    ? 'bg-[#080808] border-[#C6FF00]/40 text-white'
                    : participant.status === 'REJECTED'
                    ? 'bg-red-950/30 border-red-500/40 text-red-300'
                    : 'bg-[#080808] border-white/10 text-zinc-600'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    {participant.status === 'REJECTED' ? (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Clock className={`w-3.5 h-3.5 ${currentStage >= 2 ? 'text-[#C6FF00]' : 'text-zinc-600'}`} />
                    )}
                    <span>02 // AUDITING</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Under Verification</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans font-light">Bank settlement matching in progress.</p>
                </div>

                {/* Stage 3 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  currentStage >= 3
                    ? 'bg-[#080808] border-[#C6FF00]/40 text-white'
                    : 'bg-[#080808] border-white/10 text-zinc-600'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <BadgeCheck className={`w-3.5 h-3.5 ${currentStage >= 3 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span>03 // CONFIRMED</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Approved Candidate</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans font-light">Audition &amp; slot confirmed.</p>
                </div>

                {/* Stage 4 */}
                <div className={`p-4 rounded-sm border transition-all ${
                  currentStage >= 4
                    ? 'bg-[#080808] border-emerald-500/40 text-white'
                    : 'bg-[#080808] border-white/10 text-zinc-600'
                }`}>
                  <div className="flex items-center space-x-2 text-xs font-bold mb-1">
                    <Sparkles className={`w-3.5 h-3.5 ${currentStage >= 4 ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    <span>04 // PASS ISSUED</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">Digital Pass Active</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-sans font-light">Accreditation pass ready for print.</p>
                </div>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono">
              <div className="bg-[#080808] border border-white/10 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Total Showcase Fee</span>
                <span className="text-2xl font-bold text-white">₹{participant.total_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#080808] border border-emerald-500/20 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">Verified Amount Paid</span>
                <span className="text-2xl font-bold text-emerald-400">₹{participant.amount_paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#080808] border border-[#C6FF00]/30 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#C6FF00] block mb-1">Outstanding Balance</span>
                <span className="text-2xl font-bold text-[#C6FF00]">₹{participant.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Outstanding Balance Banner with Action */}
            {participant.balance_due > 0 && participant.status !== 'REJECTED' && (
              <div className="mt-6 p-4 rounded-sm bg-[#080808] border border-[#C6FF00]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-mono-editorial text-xs font-bold text-[#C6FF00] uppercase tracking-wider">
                    OUTSTANDING BALANCE: ₹{participant.balance_due.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-[#BFC3C7] mt-0.5 font-light">
                    Clear your balance prior to stage rehearsals to secure full backstage clearance.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (setBalanceRegId) setBalanceRegId(participant.reg_id);
                    setActiveTab('balance');
                  }}
                  className="px-6 py-3 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider transition-all shrink-0 flex items-center space-x-1.5 shadow-md active:scale-98"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>PAY REMAINING BALANCE</span>
                </button>
              </div>
            )}
          </div>

          {/* 5.2 OFFICIAL RUNWAY SHOW DIGITAL PASS CARD */}
          {(participant.status === 'FULLY_PAID' || participant.status === 'PARTIALLY_PAID') && (
            <div className="relative overflow-hidden bg-[#12141a] border-2 border-white/20 rounded-sm p-6 sm:p-10 shadow-2xl print:border-black print:bg-white print:text-black">
              {/* Pass Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative px-3.5 py-2 rounded-sm bg-black border border-white/20 shadow-xl shrink-0">
                    <img 
                      src="/logo-clean.png" 
                      alt="SKYRA CREATIONS — Emblem" 
                      className="h-10 sm:h-12 w-auto object-contain" 
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-2xl tracking-wide">
                      SKYRA CREATIONS
                    </h3>
                    <p className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#C6FF00] font-bold">
                      RUNWAY SHOW 2026 — OFFICIAL CONTESTANT PASS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-sm bg-white/10 hover:bg-white/20 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider transition-colors print:hidden border border-white/15"
                >
                  <Printer className="w-4 h-4 text-[#C6FF00]" />
                  <span>PRINT PASS</span>
                </button>
              </div>

              {/* Pass Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2 space-y-4 text-sm font-light">
                  <div>
                    <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] block mb-0.5">
                      CONTESTANT NAME
                    </span>
                    <strong className="text-2xl sm:text-3xl text-white font-editorial tracking-wide block font-bold">
                      {participant.full_name}
                    </strong>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div>
                      <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] block mb-0.5">
                        REGISTRATION ID
                      </span>
                      <strong className="text-lg text-[#C6FF00] font-bold tracking-wider">{participant.reg_id}</strong>
                    </div>
                    <div>
                      <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] block mb-0.5">
                        CATEGORY
                      </span>
                      <strong className="text-white text-base font-sans">{participant.category}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-mono">
                    <div>
                      <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] block mb-0.5">
                        PARTICIPANT CITY
                      </span>
                      <strong className="text-white text-base font-sans">{participant.city || 'Verified Participant'}</strong>
                    </div>
                    <div>
                      <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] block mb-0.5">
                        PASS ACCREDITATION
                      </span>
                      <span className={`inline-block font-mono-editorial text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
                        participant.status === 'FULLY_PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/40'
                      }`}>
                        {participant.status === 'FULLY_PAID'
                          ? 'FULLY PAID — ALL ACCESS'
                          : `VERIFIED TOKEN (DUE: ₹${participant.balance_due})`}
                      </span>
                    </div>
                  </div>

                  {/* Official Runway Venue & Schedule Pass Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-sm bg-[#080808] border border-white/10 font-mono-editorial">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#C6FF00] font-bold block">EVENT DESTINATION</span>
                        <strong className="text-white text-xs block font-sans">Chennai City Center (Prime Auditorium)</strong>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#C6FF00] font-bold block">SCHEDULE RELEASE</span>
                        <strong className="text-white text-xs block font-sans">10 days prior to showcase</strong>
                      </div>
                    </div>
                  </div>

                  <p className="font-mono-editorial text-[10px] text-zinc-500 pt-2 border-t border-white/10 leading-relaxed">
                    Notice: Venue entry and backstage accreditation are subject to verified photo identification and compliance with rehearsal schedules.
                  </p>
                </div>

                {/* Scannable Opaque QR Code */}
                <div className="text-center p-6 bg-[#080808] rounded-sm border border-white/15 flex flex-col items-center justify-center">
                  <div className="bg-white p-3.5 rounded-sm shadow-xl mb-3">
                    <QRCodeSVG
                      value={participant.pass_token || `SKYRA-PASS-${participant.reg_id}`}
                      size={150}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7]">
                    SECURITY TOKEN
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 mt-0.5">
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
