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
          className="inline-flex items-center space-x-2 font-mono-editorial text-[11px] transition-colors"
          style={{ color: 'var(--text-muted)' }}
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
          <span 
            className="px-3 py-1 rounded-sm font-mono-editorial text-[10px] font-bold tracking-wider"
            style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
          >
            ● REGISTRATION ACTIVE
          </span>
          <span 
            className="px-3 py-1 rounded-sm font-mono-editorial text-[10px]"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            ID: {eventId}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
          SKYRA CREATIONS — RUNWAY SHOW 2026
        </h1>

        <div className="flex flex-wrap items-center gap-4 font-mono-editorial text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <strong style={{ color: 'var(--text-primary)' }}>Chennai City Center (Tamil Nadu)</strong>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>SEASON 2026</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span>REPORTING RELEASED 10 DAYS PRIOR</span>
          </span>
        </div>
      </motion.div>

      {/* Cover Image */}
      <div 
        className="rounded-sm overflow-hidden shadow-2xl"
        style={{ border: '1px solid var(--border)' }}
      >
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
            <h2 className="font-editorial text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Event Overview
            </h2>
            <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
              SKYRA CREATIONS invites aspiring and experienced models, children, teens, and fashion enthusiasts to take part in our signature Runway Show 2026 in Chennai. Participants walk on a professionally designed runway stage equipped with intelligent moving heads, runway sound engineering, and dedicated press photography.
            </p>
          </div>

          {/* Participant Benefits */}
          <div className="space-y-4">
            <h2 className="font-editorial text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              What Participants Receive
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-sm flex items-start space-x-2.5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Solo and group ramp walk under professional stage choreography.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Official digital &amp; physical Certificate of Participation.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>High-resolution stage action photographs for your portfolio.</span>
              </div>
              <div className="p-4 rounded-sm flex items-start space-x-2.5" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Pre-show ramp walk orientation and posture grooming.</span>
              </div>
            </div>
          </div>

          {/* Eligibility & Categories */}
          <div className="space-y-3">
            <h2 className="font-editorial text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Eligibility &amp; Age Categories
            </h2>
            <div className="space-y-2 text-xs leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Participation is open to all applicants regardless of previous modelling experience. Categories are organized as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Kids Category:</strong> Ages 4 to 12 years.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Teens Category:</strong> Ages 13 to 17 years.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Adult Commercial &amp; Couture:</strong> Ages 18 to 35 years.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Plus-Size &amp; Fitness Category:</strong> Celebrating body diversity and athletic presentation.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Classic Category:</strong> Contestants up to age 50.</li>
              </ul>
            </div>
          </div>

          {/* Event Rules & Non-Refundable Fee Policy */}
          <div 
            className="p-6 rounded-sm text-xs space-y-2"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <div className="flex items-center space-x-2 font-mono-editorial text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
              <AlertCircle className="w-4 h-4" />
              <span>OFFICIAL EVENT POLICY NOTICE</span>
            </div>
            <p className="leading-relaxed font-light">
              The total registration fee for Runway Show 2026 is <strong style={{ color: 'var(--text-primary)' }}>₹3,000</strong>. A token advance of ₹500, ₹1,000, or ₹1,500 secures your slot. All registration fees are strictly non-refundable and non-transferable under any circumstances, as production and venue reservations are committed immediately upon booking.
            </p>
          </div>
        </div>

        {/* Right Column: Fee & Registration Box */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            className="p-6 sm:p-8 rounded-sm shadow-xl space-y-6 sticky top-28"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>TOTAL FEE</span>
              <div className="text-3xl font-black font-editorial mt-1" style={{ color: 'var(--text-primary)' }}>
                ₹{totalFee.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] block mt-0.5 font-light" style={{ color: 'var(--text-muted)' }}>Comprehensive showcase entry</span>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-mono-editorial text-[10px] block" style={{ color: 'var(--text-muted)' }}>TOKEN ADVANCE CHOICES</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                {advances.map(amt => (
                  <div 
                    key={amt} 
                    className="p-2.5 rounded-sm"
                    style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                  >
                    <strong className="block font-mono text-sm" style={{ color: 'var(--accent)' }}>₹{amt}</strong>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Advance</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-light" style={{ color: 'var(--text-muted)' }}>
                Remaining balance is payable securely through our balance portal prior to the event.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('register')}
                className="w-full py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000'
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>REGISTER FOR THIS EVENT</span>
              </button>
            </div>

            <div className="text-center">
              <span className="font-mono-editorial text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                RECIPIENT: B SRIRAM (INDIAN BANK 5056)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
