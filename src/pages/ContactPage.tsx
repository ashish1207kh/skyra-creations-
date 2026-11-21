import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Send,
  Sparkles
} from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold uppercase tracking-widest inline-block">
          Official Support &amp; Enquiries
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
          Connect with SKYRA CREATIONS
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
          Have queries regarding registration, audition schedules, or event logistics? Reach out to our team directly.
        </p>
      </div>

      {/* Official Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Instagram */}
        <a
          href="https://www.instagram.com/skyra_creations_/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-pink-500/40 transition-all group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wider">Social Media</span>
            <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white mt-1">@skyra_creations_</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Official Instagram profile for updates, casting calls, and backstage media.
            </p>
          </div>
          <span className="text-xs font-bold text-pink-500 mt-4 block">Visit Profile →</span>
        </a>

        {/* Card 2: Helpline */}
        <a
          href="tel:+919342049287"
          className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wider">Event Support</span>
            <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white mt-1">+91 93420 49287</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Calling &amp; WhatsApp helpline for registered models and parent enquiries.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-500 mt-4 block">Call Helpline →</span>
        </a>

        {/* Card 3: Location */}
        <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wider">City of Operation</span>
            <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white mt-1">Chennai, Tamil Nadu</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Premier city center auditorium destinations across Chennai.
            </p>
          </div>
          <span className="text-xs text-zinc-500 mt-4 block">Venue City</span>
        </div>

        {/* Card 4: Website */}
        <a
          href="https://www.skyracreations.site"
          className="p-6 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 transition-all group shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-zinc-500 block uppercase tracking-wider">Official Portal</span>
            <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white mt-1">skyracreations.site</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Authoritative registration, balance clearance, and digital pass gateway.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-500 mt-4 block">Secure Site →</span>
        </a>
      </div>

      {/* Contact Form & WhatsApp Outreach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
              Send an Inquiry to Official Desk
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Connect directly via verified WhatsApp messaging for instant assistance.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Full Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white dark:bg-[#0a0c12] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Calling / WhatsApp Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full bg-white dark:bg-[#0a0c12] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Message / Query <span className="text-amber-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about auditions, age criteria, reporting schedule, or payments..."
                className="w-full bg-white dark:bg-[#0a0c12] border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect via WhatsApp (+91 93420 49287)</span>
            </button>
          </form>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-zinc-100 dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 space-y-1"
              >
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                  {faq.q}
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
