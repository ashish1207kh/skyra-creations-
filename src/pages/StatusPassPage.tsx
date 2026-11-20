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
  XCircle
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
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Confirmed & Cleared</span>
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Advance Verified (Balance Pending)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
            <XCircle className="w-3.5 h-3.5" />
            <span>Payment Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Clock className="w-3.5 h-3.5" />
            <span>Verification In Progress</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Participant Self-Service Portal</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Check Registration & Entry Pass
        </h1>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Enter your Registration ID, registered phone number, or email to track payment verification and view your pass.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Enter Registration ID (e.g. SC-2026-1001) or Mobile Number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-semibold rounded-xl text-sm transition-all shrink-0 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Participant Results */}
      {participant && (
        <div className="space-y-8">
          {/* Status & Financial Summary */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <span className="text-xs text-amber-400 font-mono tracking-wider uppercase font-semibold">{participant.reg_id}</span>
                <h2 className="text-2xl font-bold text-white mt-1">{participant.full_name}</h2>
                <p className="text-xs text-zinc-400 mt-1">{participant.category} • {participant.city}</p>
              </div>
              <div>
                {getStatusBadge(participant.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-[#0a0c12] p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Total Registration Fee</span>
                <p className="text-xl font-bold text-white mt-1">₹{participant.total_fee}</p>
              </div>
              <div className="bg-[#0a0c12] p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Verified Paid to Date</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹{participant.amount_paid}</p>
              </div>
              <div className="bg-[#0a0c12] p-4 rounded-xl border border-amber-500/30">
                <span className="text-xs text-amber-400 font-semibold">Remaining Balance Due</span>
                <p className="text-xl font-bold text-amber-300 mt-1">₹{participant.balance_due}</p>
              </div>
            </div>

            {participant.balance_due > 0 && (
              <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-zinc-300">
                  <span className="font-semibold text-amber-300">Outstanding Balance: ₹{participant.balance_due}</span>
                  <p className="text-zinc-400 mt-0.5">Please clear your balance to receive full runway confirmation.</p>
                </div>
                <button
                  onClick={() => {
                    if (setBalanceRegId) setBalanceRegId(participant.reg_id);
                    setActiveTab('balance');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-all flex items-center space-x-1.5 shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Remaining ₹{participant.balance_due}</span>
                </button>
              </div>
            )}
          </div>

          {/* Official Runway Show Digital Pass Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#191e2b] via-[#12151f] to-[#0c0e14] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-black border border-amber-500/40 p-1 flex items-center justify-center shadow-lg">
                  <img src="/logo.png" alt="Skyra Creations" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-lg tracking-wider">SKYRA CREATIONS</h3>
                  <p className="text-[10px] tracking-widest uppercase text-amber-400 font-medium">Official Runway Entry Pass</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Contestant Name</span>
                  <div className="text-xl sm:text-2xl font-bold text-white">{participant.full_name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Registration ID</span>
                    <span className="font-mono text-amber-400 font-bold text-sm">{participant.reg_id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Category</span>
                    <span className="text-white font-medium">{participant.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">City</span>
                    <span className="text-white font-medium">{participant.city}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Contact Phone</span>
                    <span className="text-zinc-300 font-mono">{participant.mobile}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3 text-xs">
                  <span className="text-zinc-400">Pass Clearance:</span>
                  {participant.status === 'FULLY_PAID' ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Full Event Entry Confirmed</span>
                    </span>
                  ) : participant.status === 'PARTIALLY_PAID' ? (
                    <span className="text-amber-400 font-semibold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Advance Cleared (Balance Due on Arrival)</span>
                    </span>
                  ) : (
                    <span className="text-zinc-400">Verification Pending</span>
                  )}
                </div>
              </div>

              {/* QR Code on Pass */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={`SKYRA-PASS:${participant.reg_id}:${participant.full_name}:${participant.status}`}
                  size={140}
                  level="H"
                  includeMargin={true}
                />
                <span className="text-[10px] text-zinc-600 font-mono mt-1 font-semibold">{participant.reg_id}</span>
              </div>
            </div>
          </div>

          {/* Payment History Audit Trail */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-base font-bold text-white mb-4">Payment Submission History</h3>

            <div className="space-y-3">
              {participant.payments && participant.payments.length > 0 ? (
                participant.payments.map((p, idx) => (
                  <div
                    key={p.payment_id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0c12] border border-zinc-800 rounded-xl gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {p.payment_type === 'INITIAL_REGISTRATION' ? 'Initial Registration' : 'Balance Installment'}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">{p.payment_id}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">UTR: <span className="text-zinc-300 font-mono">{p.transaction_id}</span></p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-base font-bold text-white">₹{p.amount}</span>
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        p.status === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'REJECTED'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">No payment records found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
