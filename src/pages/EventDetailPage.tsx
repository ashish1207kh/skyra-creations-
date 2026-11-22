import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  ArrowRight, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { getPaymentInfo } from '../lib/api';
import { PaymentInfo } from '../types/index';
import MagneticButton from '../components/MagneticButton';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActiveTab('events')}
          className="inline-flex items-center space-x-2 font-mono-editorial text-[11px] text-[#BFC3C7] hover:text-[#C6FF00] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO ALL EVENTS</span>
        </button>
      </div>

      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-sm font-mono-editorial text-[10px] font-bold tracking-wider bg-[#C6FF00] text-black">
            ● REGISTRATION ACTIVE
          </span>
          <span className="px-3 py-1 rounded-sm font-mono-editorial text-[10px] bg-[#12141a] border border-white/10 text-white">
            ID: {eventId}
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight text-white">
          RUNWAY SHOW 2026
        </h1>

        <div className="flex flex-wrap items-center gap-4 font-mono-editorial text-[11px] text-[#BFC3C7]">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C6FF00]" />
            <strong className="text-white">Chennai City Center (Tamil Nadu)</strong>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>SEASON 2026</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>REPORTING RELEASED 10 DAYS PRIOR</span>
          </span>
        </div>
      </motion.div>

      {/* Cover Image */}
      <div className="rounded-sm overflow-hidden shadow-2xl border border-white/10">
        <img 
          src="/images/runway-2.jpg" 
          alt="Runway Show 2026 Stage" 
          loading="lazy"
          className="w-full h-80 sm:h-96 object-cover"
        />
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Comprehensive Event Information */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-white">
              EVENT OVERVIEW
            </h2>
            <p className="text-sm leading-relaxed font-light text-[#BFC3C7]">
              SKYRA CREATIONS invites aspiring and experienced models, children, teens, and fashion enthusiasts to take part in our signature Runway Show 2026 in Chennai. Participants walk on a professionally designed runway stage equipped with intelligent moving heads, runway sound engineering, and dedicated press photography.
            </p>
          </div>

          {/* Participant Benefits */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              WHAT PARTICIPANTS RECEIVE
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-sm flex items-start space-x-2.5 bg-[#12141a] border border-white/10 text-[#BFC3C7] font-light">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C6FF00]" />
                <span>Solo and group ramp walk under professional stage choreography.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5 bg-[#12141a] border border-white/10 text-[#BFC3C7] font-light">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C6FF00]" />
                <span>Official digital &amp; physical Certificate of Participation.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5 bg-[#12141a] border border-white/10 text-[#BFC3C7] font-light">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C6FF00]" />
                <span>High-resolution stage action photographs for your portfolio.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5 bg-[#12141a] border border-white/10 text-[#BFC3C7] font-light">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C6FF00]" />
                <span>Pre-show ramp walk orientation and posture grooming.</span>
              </div>
            </div>
          </div>

          {/* Eligibility & Categories */}
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-white">
              ELIGIBILITY &amp; AGE CATEGORIES
            </h2>
            <div className="space-y-2 text-xs leading-relaxed font-light text-[#BFC3C7]">
              <p>
                Participation is open to all applicants regardless of previous modelling experience. Categories are organized as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#BFC3C7]">
                <li><strong className="text-white">Kids Category:</strong> Ages 4 to 12 years.</li>
                <li><strong className="text-white">Teens Category:</strong> Ages 13 to 17 years.</li>
                <li><strong className="text-white">Adult Commercial &amp; Couture:</strong> Ages 18 to 35 years.</li>
                <li><strong className="text-white">Plus-Size &amp; Fitness Category:</strong> Celebrating body diversity and athletic presentation.</li>
                <li><strong className="text-white">Classic Category:</strong> Contestants up to age 50.</li>
              </ul>
            </div>
          </div>

          {/* Event Rules & Non-Refundable Fee Policy */}
          <div className="p-6 rounded-sm text-xs space-y-2 bg-[#12141a] border border-white/10 text-[#BFC3C7]">
            <div className="flex items-center space-x-2 font-mono-editorial text-[10px] font-bold uppercase tracking-wider text-[#C6FF00]">
              <AlertCircle className="w-4 h-4" />
              <span>OFFICIAL EVENT POLICY NOTICE</span>
            </div>
            <p className="leading-relaxed font-light">
              The total registration fee for Runway Show 2026 is <strong className="text-white">₹3,000</strong>. A token advance of ₹500, ₹1,000, or ₹1,500 secures your slot. All registration fees are strictly non-refundable and non-transferable under any circumstances, as production and venue reservations are committed immediately upon booking.
            </p>
          </div>
        </div>

        {/* Right Column: Fee & Registration Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-sm shadow-xl space-y-6 sticky top-28 bg-[#12141a] border border-white/10">
            <div className="pb-4 border-b border-white/10">
              <span className="font-mono-editorial block text-[10px] text-[#BFC3C7]">TOTAL PARTICIPATION FEE</span>
              <div className="text-4xl font-black font-editorial mt-1 text-white">
                ₹{totalFee.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] block mt-0.5 font-light text-zinc-400">Comprehensive showcase entry</span>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-mono-editorial text-[10px] block text-[#BFC3C7]">TOKEN ADVANCE CHOICES</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                {advances.map(amt => (
                  <div 
                    key={amt} 
                    className="p-2.5 rounded-sm bg-[#080808] border border-white/10"
                  >
                    <strong className="block text-sm text-[#C6FF00]">₹{amt}</strong>
                    <span className="text-[10px] text-zinc-400 font-mono-editorial uppercase">Advance</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-light text-zinc-400">
                Remaining balance is payable securely prior to the event.
              </p>
            </div>

            <div className="pt-2">
              <MagneticButton
                onClick={() => setActiveTab('register')}
                className="w-full py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center space-x-2 bg-[#C6FF00] hover:bg-[#D8FF33] text-black"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>REGISTER FOR THIS EVENT</span>
              </MagneticButton>
            </div>

            <div className="text-center font-mono-editorial text-[10px] text-zinc-400">
              RECIPIENT: B SRIRAM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
