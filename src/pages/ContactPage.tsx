import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare, 
  HelpCircle, 
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import InstagramIcon from '../components/InstagramIcon';

interface ContactPageProps {
  setActiveTab: (tab: string) => void;
}

export default function ContactPage({ setActiveTab }: ContactPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    // Direct to official WhatsApp support
    const text = `Hello SKYRA CREATIONS, My name is ${name} (${phone}). Inquiry: ${message}`;
    const url = `https://wa.me/919342049287?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'What is the total registration fee for Runway Show 2026?',
      a: 'The total participation fee is ₹3,000. You can register by paying a token advance of ₹500, ₹1,000, or ₹1,500. The remaining balance can be cleared through our balance payment portal prior to the event.',
    },
    {
      q: 'Where will the event be held?',
      a: 'The event will be held in Chennai City Center (strictly within the central urban zone, not in remote outskirts). The exact venue address and reporting times are communicated to verified contestants 10 days before the event.',
    },
    {
      q: 'Who is eligible to participate?',
      a: 'Participation is open to male, female, kids (ages 4-12), teens (ages 13-17), commercial models (ages 18-35), plus-size models, and fitness/classic models (up to age 50). Prior experience is not mandatory.',
    },
    {
      q: 'Is the registration fee refundable?',
      a: 'No. All registration fees are strictly non-refundable and non-transferable under all circumstances, as production, venue booking, and stage allocation are committed upon slot reservation.',
    },
    {
      q: 'How do I receive my contestant pass?',
      a: 'Once your UPI transaction reference (UTR) and screenshot are manually verified by our team, a digital verification pass with an official QR code is issued on our Check Status & Pass portal.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest" style={{ color: 'var(--accent)' }}>
          OFFICIAL SUPPORT &amp; ENQUIRIES
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
          GET IN TOUCH.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Have queries regarding registration, audition schedules, or event logistics? Reach out to our team directly.
        </p>
      </motion.div>

      {/* Official Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Instagram */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          href="https://www.instagram.com/skyra_creations_/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-sm"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div>
            <div 
              className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              <InstagramIcon className="w-5 h-5 text-[#E1306C]" />
            </div>
            <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>SOCIAL MEDIA</span>
            <h3 className="font-editorial text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>@skyra_creations_</h3>
            <p className="text-xs mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>
              Official Instagram profile for updates, casting calls, and backstage media.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block" style={{ color: 'var(--accent)' }}>VISIT PROFILE →</span>
        </motion.a>

        {/* Card 2: Helpline */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          href="tel:+919342049287"
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-sm"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div>
            <div 
              className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              <Phone className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>EVENT HELPLINE</span>
            <h3 className="font-editorial text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>+91 93420 49287</h3>
            <p className="text-xs mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>
              Calling &amp; WhatsApp helpline for registered models and parent enquiries.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block" style={{ color: 'var(--accent)' }}>CALL HELPLINE →</span>
        </motion.a>

        {/* Card 3: Location */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 rounded-sm flex flex-col justify-between shadow-sm"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div>
            <div 
              className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>DESTINATION</span>
            <h3 className="font-editorial text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>Chennai, Tamil Nadu</h3>
            <p className="text-xs mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>
              Premier city center auditorium destinations across Chennai.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] mt-4 block" style={{ color: 'var(--text-muted)' }}>VENUE CITY</span>
        </motion.div>

        {/* Card 4: Website */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          href="https://www.skyracreations.site"
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-sm"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div>
            <div 
              className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            >
              <Globe className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-mono-editorial block text-[10px]" style={{ color: 'var(--text-muted)' }}>OFFICIAL PORTAL</span>
            <h3 className="font-editorial text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>skyracreations.site</h3>
            <p className="text-xs mt-2 font-light" style={{ color: 'var(--text-secondary)' }}>
              Authoritative registration, balance clearance, and digital pass gateway.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block" style={{ color: 'var(--accent)' }}>SECURE SITE →</span>
        </motion.a>
      </div>

      {/* Contact Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 p-8 sm:p-10 rounded-sm shadow-xl space-y-6"
          style={{ 
            backgroundColor: 'var(--surface)', 
            border: '1px solid var(--border)' 
          }}
        >
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Send an Inquiry to Official Desk
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Connect directly via verified WhatsApp messaging for instant assistance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-editorial text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                YOUR FULL NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block font-mono-editorial text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                CALLING / WHATSAPP NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block font-mono-editorial text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                MESSAGE / QUERY *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about auditions, age criteria, reporting schedule, or payments..."
                className="w-full p-4 text-xs sm:text-sm rounded-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#000000'
              }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>CONNECT VIA WHATSAPP (+91 93420 49287)</span>
            </button>
          </form>
        </motion.div>

        {/* FAQs */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5 space-y-4"
        >
          <div className="flex items-center space-x-2 font-mono-editorial text-[11px] font-bold" style={{ color: 'var(--accent)' }}>
            <HelpCircle className="w-4 h-4" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="p-5 rounded-sm space-y-1.5"
                style={{ 
                  backgroundColor: 'var(--surface)', 
                  border: '1px solid var(--border)' 
                }}
              >
                <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                </h4>
                <p className="text-[11px] leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
