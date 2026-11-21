import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare, 
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import InstagramIcon from '../components/InstagramIcon';
import MagneticButton from '../components/MagneticButton';
import HumanVerificationCaptcha from '../components/HumanVerificationCaptcha';

interface ContactPageProps {
  setActiveTab: (tab: string) => void;
}

export default function ContactPage({ setActiveTab }: ContactPageProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (!isCaptchaVerified) return;

    // Direct to official WhatsApp support
    const text = `Hello SKYRA CREATIONS, My name is ${name} (${phone}). Inquiry: ${message}`;
    const url = `https://wa.me/919342049287?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <span className="font-mono-editorial block text-[11px] tracking-widest text-[#C6FF00]">
          OFFICIAL SUPPORT &amp; LIAISON
        </span>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.05] text-white">
          GET IN TOUCH.
        </h1>
        <p className="text-sm sm:text-base font-light leading-relaxed text-[#BFC3C7]">
          Have queries regarding registration, audition schedules, or event logistics? Reach out to our operations team directly.
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
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-2xl bg-[#12141a] border border-white/10 hover:border-white/30"
        >
          <div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-[#080808] border border-white/10 group-hover:scale-105 transition-transform">
              <InstagramIcon className="w-5 h-5 text-[#E1306C]" />
            </div>
            <span className="font-mono-editorial block text-[10px] text-[#BFC3C7]">SOCIAL MEDIA</span>
            <h3 className="font-display text-xl font-bold mt-1 text-white">@skyra_creations_</h3>
            <p className="text-xs mt-2 font-light text-[#BFC3C7]">
              Official Instagram profile for updates, casting calls, and backstage media.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block text-[#C6FF00]">VISIT PROFILE →</span>
        </motion.a>

        {/* Card 2: Helpline */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          href="tel:+919342049287"
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-2xl bg-[#12141a] border border-white/10 hover:border-white/30"
        >
          <div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-[#080808] border border-white/10 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <span className="font-mono-editorial block text-[10px] text-[#BFC3C7]">EVENT HELPLINE</span>
            <h3 className="font-display text-xl font-bold mt-1 text-white">+91 93420 49287</h3>
            <p className="text-xs mt-2 font-light text-[#BFC3C7]">
              Calling &amp; WhatsApp helpline for registered models and parent enquiries.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block text-[#C6FF00]">CALL HELPLINE →</span>
        </motion.a>

        {/* Card 3: Location */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 rounded-sm flex flex-col justify-between shadow-2xl bg-[#12141a] border border-white/10"
        >
          <div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-[#080808] border border-white/10">
              <MapPin className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <span className="font-mono-editorial block text-[10px] text-[#BFC3C7]">DESTINATION</span>
            <h3 className="font-display text-xl font-bold mt-1 text-white">Chennai, Tamil Nadu</h3>
            <p className="text-xs mt-2 font-light text-[#BFC3C7]">
              Premier city center auditorium destinations across central Chennai.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] mt-4 block text-zinc-400">VENUE CITY</span>
        </motion.div>

        {/* Card 4: Website */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          href="https://www.skyracreations.site"
          className="p-6 rounded-sm transition-all group flex flex-col justify-between shadow-2xl bg-[#12141a] border border-white/10 hover:border-white/30"
        >
          <div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4 bg-[#080808] border border-white/10 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <span className="font-mono-editorial block text-[10px] text-[#BFC3C7]">OFFICIAL PORTAL</span>
            <h3 className="font-display text-xl font-bold mt-1 text-white">skyracreations.site</h3>
            <p className="text-xs mt-2 font-light text-[#BFC3C7]">
              Authoritative registration, balance clearance, and digital pass gateway.
            </p>
          </div>
          <span className="font-mono-editorial text-[10px] font-bold mt-4 block text-[#C6FF00]">SECURE SITE →</span>
        </motion.a>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="p-8 sm:p-12 rounded-sm shadow-2xl space-y-6 bg-[#12141a] border border-white/10"
        >
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              SEND INQUIRY TO OPERATIONS DESK
            </h2>
            <p className="text-xs mt-1 text-[#BFC3C7] font-light">
              Connect directly via verified WhatsApp messaging for instant assistance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-editorial text-[10px] uppercase text-[#BFC3C7] mb-1.5">
                YOUR FULL NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-sm transition-all focus:outline-none bg-[#080808] border border-white/15 text-white focus:border-[#C6FF00]"
              />
            </div>

            <div>
              <label className="block font-mono-editorial text-[10px] uppercase text-[#BFC3C7] mb-1.5">
                CALLING / WHATSAPP NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-sm transition-all focus:outline-none bg-[#080808] border border-white/15 text-white focus:border-[#C6FF00]"
              />
            </div>

            <div>
              <label className="block font-mono-editorial text-[10px] uppercase text-[#BFC3C7] mb-1.5">
                MESSAGE / QUERY *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about auditions, age criteria, reporting schedule, or payments..."
                className="w-full p-4 text-xs sm:text-sm rounded-sm transition-all focus:outline-none bg-[#080808] border border-white/15 text-white focus:border-[#C6FF00]"
              />
            </div>

            {/* Anti-Bot Security Verification */}
            <HumanVerificationCaptcha 
              label="SECURITY CHECK // INQUIRY DESK"
              onVerified={setIsCaptchaVerified}
            />

            <MagneticButton
              type="submit"
              disabled={!isCaptchaVerified}
              className="w-full py-4 font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center space-x-2 bg-[#C6FF00] hover:bg-[#D8FF33] text-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CONNECT VIA WHATSAPP (+91 93420 49287)</span>
            </MagneticButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
