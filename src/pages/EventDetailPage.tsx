import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';
import { getPaymentInfo } from '../lib/api';
import { PaymentInfo } from '../types/index';

interface EventDetailPageProps {
  eventId?: string;
  setActiveTab: (tab: string) => void;
}

export default function EventDetailPage({ eventId = 'EVT-CHX-2026', setActiveTab }: EventDetailPageProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    getPaymentInfo()
      .then((data) => setPaymentInfo(data))
      .catch((err) => console.error('Failed to load event:', err));
  }, []);

  const totalFee = paymentInfo?.default_total_fee || 3000;
  const advances = paymentInfo?.allowed_token_advances || [500, 1000, 1500];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActiveTab('events')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-zinc-500 hover:text-amber-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            ● Active Registration
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-mono">
            {eventId}
          </span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
          SKYRA CREATIONS — RUNWAY SHOW 2026
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-amber-500" />
            <strong className="text-zinc-800 dark:text-zinc-200">Chennai City Center (Tamil Nadu)</strong>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Official 2026 Showcase Season</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Venue details released 10 days before event</span>
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        <img 
          src="/images/runway-2.jpg" 
          alt="Runway Show 2026 Stage" 
          className="w-full h-80 sm:h-96 object-cover"
        />
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Comprehensive Event Information */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <div className="space-y-3">
            <h3 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
              Event Overview
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              SKYRA CREATIONS invites aspiring and experienced models, children, teens, and fashion enthusiasts to take part in our signature Runway Show 2026 in Chennai. Participants walk on a professionally designed runway stage equipped with intelligent moving heads, runway sound engineering, and dedicated press photography.
            </p>
          </div>

          {/* Participant Benefits */}
          <div className="space-y-3">
            <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
              What Participants Receive
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Solo and group ramp walk under professional stage choreography.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Official digital &amp; physical Certificate of Participation.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>High-resolution stage action photographs for your portfolio.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Pre-show ramp walk orientation and posture grooming.</span>
              </div>
            </div>
          </div>

          {/* Eligibility & Categories */}
          <div className="space-y-3">
            <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
              Eligibility &amp; Age Categories
            </h3>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>
                Participation is open to all applicants regardless of previous modelling experience. Categories are organized as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-700 dark:text-zinc-300">
                <li><strong>Kids Category:</strong> Ages 4 to 12 years.</li>
                <li><strong>Teens Category:</strong> Ages 13 to 17 years.</li>
                <li><strong>Adult Commercial &amp; Couture:</strong> Ages 18 to 35 years.</li>
                <li><strong>Plus-Size &amp; Fitness Category:</strong> Celebrating body diversity and athletic presentation.</li>
                <li><strong>Classic Category:</strong> Contestants up to age 50.</li>
              </ul>
            </div>
          </div>

          {/* Event Rules & Non-Refundable Fee Policy */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 text-zinc-800 dark:text-zinc-200">
            <div className="flex items-center space-x-2 text-amber-500 font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Official Event Policy Notice</span>
            </div>
            <p className="leading-relaxed">
              The total registration fee for Runway Show 2026 is <strong>₹3,000</strong>. A token advance of ₹500, ₹1,000, or ₹1,500 secures your slot. All registration fees are strictly non-refundable and non-transferable under any circumstances, as production and venue reservations are committed immediately upon booking.
            </p>
          </div>
        </div>

        {/* Right Column: Fee & Registration Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border-2 border-amber-500/40 shadow-xl space-y-6 sticky top-28">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <span className="text-xs uppercase tracking-wider text-zinc-500 block">Total Participation Fee</span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white font-editorial mt-1">
                ₹{totalFee.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-zinc-500 block mt-0.5">Comprehensive showcase entry</span>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">Token Advance Choices:</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {advances.map(amt => (
                  <div key={amt} className="p-2.5 rounded-xl bg-zinc-200 dark:bg-black/50 border border-zinc-300 dark:border-zinc-800">
                    <strong className="text-zinc-900 dark:text-amber-400 block font-mono text-sm">₹{amt}</strong>
                    <span className="text-[10px] text-zinc-500">Advance</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">
                Remaining balance is payable securely through our balance portal prior to the event.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('register')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Register for this Event</span>
              </button>
            </div>

            <div className="text-center">
              <span className="text-[11px] text-zinc-500 block">
                Instant UPI verification with B Sriram (Indian Bank 5056)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
