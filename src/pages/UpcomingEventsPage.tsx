import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  ShieldCheck, 
  IndianRupee,
  Users
} from 'lucide-react';
import { getPaymentInfo } from '../lib/api';
import { PaymentInfo } from '../types/index';

interface UpcomingEventsPageProps {
  setActiveTab: (tab: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export default function UpcomingEventsPage({ setActiveTab, onSelectEvent }: UpcomingEventsPageProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentInfo()
      .then((data) => setPaymentInfo(data))
      .catch((err) => console.error('Failed to load event info:', err))
      .finally(() => setLoading(false));
  }, []);

  const eventTitle = paymentInfo?.event_name || 'SKYRA CREATIONS — RUNWAY SHOW 2026';
  const location = paymentInfo?.location || 'Chennai (City Center — Not outer)';
  const totalFee = paymentInfo?.default_total_fee || 3000;
  const advances = paymentInfo?.allowed_token_advances || [500, 1000, 1500];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest inline-block">
          Official Event Calendar
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
          Upcoming Fashion &amp; Runway Events
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
          Discover verified fashion runway showcases and model auditions organized by SKYRA CREATIONS. Select an event below to inspect details or register.
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Event Card */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md">
            <img 
              src="/images/runway-1.jpg" 
              alt={eventTitle} 
              className="w-full h-72 sm:h-80 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-black font-bold text-xs uppercase tracking-wider shadow">
                ● Registrations Active
              </span>
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono">
              ID: {paymentInfo?.event_id || 'EVT-CHX-2026'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-amber-500" />
                <strong className="text-zinc-800 dark:text-zinc-200">{location}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Runway Season 2026</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-amber-500" />
                <span>All Age Categories (4 to 50)</span>
              </span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {eventTitle}
            </h2>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              Join Tamil Nadu's celebrated runway showcase in Chennai. Featuring professional ramp walking, costume changes, certificate of participation, and live stage exposure for fresh and experienced contestants.
            </p>
          </div>

          {/* Pricing & Advance Tokens */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0a0c12] border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block">Total Event Fee</span>
              <strong className="text-zinc-900 dark:text-white text-base">₹{totalFee.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Token Advance Options</span>
              <strong className="text-amber-500 text-sm">
                {advances.map(a => `₹${a}`).join(' / ')}
              </strong>
            </div>
            <div>
              <span className="text-zinc-500 block">Venue Notice</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px] block mt-0.5">
                Announced 10 days before event
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onSelectEvent) onSelectEvent('EVT-CHX-2026');
                setActiveTab('event-details');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View Event Details</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Register Now (from ₹500 Advance)</span>
            </button>
          </div>
        </div>

        {/* Sidebar Info & Event Policy */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Event Guidelines</span>
            </h3>
            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Strictly Chennai City Center venue (not remote outskirts).</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Token advance of ₹500, ₹1,000, or ₹1,500 secures your audition slot.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Balance payable anytime before stage rehearsals.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Official digital pass token issued upon payment verification.</span>
              </div>
            </div>
          </div>

          {/* Assistance Box */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest block">Need Help?</span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Have questions about registration?</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Contact our official event coordinator on WhatsApp or Instagram for quick support.
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-block pt-1"
            >
              Contact Event Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
