import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Users,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest" style={{ color: 'var(--accent)' }}>
          OFFICIAL EVENT CALENDAR
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
          THE RUNWAY AWAITS.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Explore upcoming fashion experiences and discover your next opportunity.
        </p>
      </motion.div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Main Event Card */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-8 p-8 sm:p-10 rounded-sm shadow-xl space-y-6"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div 
            className="relative overflow-hidden rounded-sm shadow-md"
            style={{ border: '1px solid var(--border)' }}
          >
            <img 
              src="/images/runway-1.jpg" 
              alt={eventTitle} 
              loading="lazy"
              className="w-full h-72 sm:h-84 object-cover"
            />
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1 font-mono-editorial text-[10px] font-bold tracking-wider rounded-sm shadow"
                style={{ backgroundColor: 'var(--accent)', color: '#000000' }}
              >
                ● REGISTRATIONS ACTIVE
              </span>
            </div>
            <div 
              className="absolute bottom-4 right-4 px-3 py-1 font-mono-editorial text-[10px] rounded-sm backdrop-blur-md"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--border)', color: '#FFFFFF' }}
            >
              ID: {paymentInfo?.event_id || 'EVT-CHX-2026'}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 font-mono-editorial text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <strong style={{ color: 'var(--text-primary)' }}>{location}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span>SEASON 2026</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                <span>AGES 4 TO 50</span>
              </span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {eventTitle}
            </h2>

            <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
              Join Tamil Nadu's celebrated runway showcase in Chennai. Featuring professional ramp walking, costume changes, certificate of participation, and live stage exposure for fresh and experienced contestants.
            </p>
          </div>

          {/* Pricing & Advance Tokens */}
          <div 
            className="p-5 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            <div>
              <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>TOTAL EVENT FEE</span>
              <strong className="text-base font-editorial" style={{ color: 'var(--text-primary)' }}>₹{totalFee.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>TOKEN ADVANCE</span>
              <strong className="text-sm" style={{ color: 'var(--accent)' }}>
                {advances.map(a => `₹${a}`).join(' / ')}
              </strong>
            </div>
            <div>
              <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>VENUE NOTICE</span>
              <span className="text-[11px] block mt-0.5 font-light" style={{ color: 'var(--text-secondary)' }}>
                Coordinates sent 10 days prior
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={() => {
                if (onSelectEvent) onSelectEvent('EVT-CHX-2026');
                setActiveTab('event-details');
              }}
              className="w-full sm:w-auto px-6 py-3.5 font-mono-editorial text-xs font-semibold rounded-sm transition-all flex items-center justify-center space-x-2"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>VIEW DETAILS</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-3.5 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>REGISTER NOW (ADVANCE ₹500+)</span>
            </button>
          </div>
        </motion.div>

        {/* Sidebar Info & Event Policy */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="p-8 rounded-sm space-y-4 shadow-xl"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <h3 className="font-editorial text-xl font-bold flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <span>Event Guidelines</span>
            </h3>
            <div className="space-y-3 text-xs font-light" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Strictly Chennai City Center venue (not remote outskirts).</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Token advance of ₹500, ₹1,000, or ₹1,500 secures audition slot.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Balance payable anytime before stage rehearsals.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <span>Official digital pass token issued upon payment verification.</span>
              </div>
            </div>
          </motion.div>

          {/* Assistance Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="p-8 rounded-sm space-y-3"
            style={{ 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)' 
            }}
          >
            <span className="font-mono-editorial text-[10px] block" style={{ color: 'var(--accent)' }}>NEED ASSISTANCE?</span>
            <h4 className="font-editorial text-base font-bold" style={{ color: 'var(--text-primary)' }}>Questions about registration?</h4>
            <p className="text-xs font-light" style={{ color: 'var(--text-muted)' }}>
              Contact our official event coordinator on WhatsApp or Instagram for quick support.
            </p>
            <button
              onClick={() => setActiveTab('contact')}
              className="font-mono-editorial text-[11px] font-bold hover:underline inline-block pt-1"
              style={{ color: 'var(--accent)' }}
            >
              CONTACT EVENT SUPPORT →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
