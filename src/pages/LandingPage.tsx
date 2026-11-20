import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  CreditCard, 
  Camera, 
  ExternalLink,
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import { PaymentInfo } from '../types/index';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  paymentInfo: PaymentInfo | null;
}

export default function LandingPage({ setActiveTab, paymentInfo }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      step: '01',
      title: 'Complete Registration Form',
      desc: 'Fill in your model profile, measurements, contact details, and runway category.',
    },
    {
      step: '02',
      title: 'Submit Manual UPI Payment',
      desc: 'Scan the official UPI QR code or pay to the verified merchant ID via GPay/PhonePe.',
    },
    {
      step: '03',
      title: 'Upload Payment Proof & UTR',
      desc: 'Upload your high-resolution screenshot and input the exact 12-digit transaction reference number.',
    },
    {
      step: '04',
      title: 'Admin Statement Verification',
      desc: 'Our finance team verifies the credit directly against bank records (pending payments do not reduce balance).',
    },
    {
      step: '05',
      title: 'Access Digital Runway Pass',
      desc: 'Receive your unique Registration ID and download your dynamic QR entry badge.',
    },
  ];

  const faqs = [
    {
      q: 'What is the fee structure for the Runway Show?',
      a: `The standard total registration fee is ₹${paymentInfo?.default_total_fee?.toLocaleString('en-IN') || '5,000'}. You can choose to pay the full fee immediately or start with an advance payment of ₹1,500 or ₹2,000 to lock in your slot.`,
    },
    {
      q: 'How does the Balance Payment portal work?',
      a: 'After your advance registration is verified, you can pay your remaining balance anytime in convenient installments (₹500 to ₹3,500) using your Registration ID on the Balance Portal.',
    },
    {
      q: 'How long does payment verification take?',
      a: 'All transactions undergo manual bank verification to ensure complete credit security. This typically takes 2 to 24 hours. Once verified, your status immediately transitions and updates your remaining balance.',
    },
    {
      q: 'What should I bring to the runway event?',
      a: 'Bring your official Digital Entry Pass (generated on the Status Portal after registration) along with a valid government photo ID.',
    },
    {
      q: 'Can I update my model portfolio photos later?',
      a: 'Yes, your profile and portfolio photos can be reviewed or updated during official backstage fittings or via our WhatsApp coordinator.',
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-ivory">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-charcoal-border">
        {/* Background Editorial Styling with Subtle Gradient & Mesh */}
        <div className="absolute inset-0 bg-[#101213]">
          <div className="absolute inset-0 bg-radial-gradient opacity-60 mix-blend-overlay"></div>
          {/* Subtle runway atmospheric lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-lime-accent/5 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-charcoal-surface/40 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center flex flex-col items-center z-10">
          {/* Editorial Badge */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-charcoal-card border border-charcoal-border text-xs uppercase tracking-widest text-lime-accent mb-8 shadow-card-subtle">
            <span className="w-2 h-2 rounded-full bg-lime-accent animate-pulse"></span>
            <span>{paymentInfo?.event_name || 'SKYRA CREATIONS — RUNWAY SHOW'}</span>
            <span className="text-charcoal-muted">•</span>
            <span className="text-charcoal-muted">Edition 2026</span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-ivory max-w-5xl leading-[1.08] mb-6">
            OWN THE STAGE.<br />
            <span className="italic font-light text-lime-accent">DEFINE THE MOMENT.</span>
          </h1>

          {/* Short Supporting Description */}
          <p className="text-lg sm:text-xl text-charcoal-muted max-w-2xl font-light leading-relaxed mb-10">
            Step into an experience where confidence meets creativity. Discover the next chapter of SKYRA CREATIONS on the premier high-fashion runway.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-btn bg-lime-accent text-charcoal font-semibold text-sm tracking-wide uppercase hover:bg-[#c9f556] active:scale-[0.98] transition-all shadow-lime-glow flex items-center justify-center space-x-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('event-details');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-btn bg-charcoal-surface border border-charcoal-border text-ivory text-sm tracking-wide uppercase font-medium hover:bg-charcoal-card hover:border-lime-accent/40 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Event</span>
              <ChevronDown className="w-4 h-4 text-charcoal-muted" />
            </button>

            <button
              onClick={() => setActiveTab('balance')}
              className="w-full sm:w-auto px-6 py-4 rounded-btn border border-charcoal-border text-charcoal-muted text-sm tracking-wide hover:text-lime-accent hover:border-lime-accent/30 transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Balance</span>
            </button>
          </div>

          {/* Event Quick Info Strip */}
          <div className="mt-16 sm:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl pt-8 border-t border-charcoal-border/70 text-left">
            <div className="bg-charcoal-card/40 p-4 rounded-card border border-charcoal-border/50">
              <span className="block text-xs uppercase tracking-wider text-charcoal-muted mb-1 font-mono">Date</span>
              <span className="text-sm sm:text-base font-medium text-ivory">Runway 2026 Edition</span>
            </div>
            <div className="bg-charcoal-card/40 p-4 rounded-card border border-charcoal-border/50">
              <span className="block text-xs uppercase tracking-wider text-charcoal-muted mb-1 font-mono">Stage</span>
              <span className="text-sm sm:text-base font-medium text-ivory">Main Fashion Hall</span>
            </div>
            <div className="bg-charcoal-card/40 p-4 rounded-card border border-charcoal-border/50">
              <span className="block text-xs uppercase tracking-wider text-charcoal-muted mb-1 font-mono">Total Fee</span>
              <span className="text-sm sm:text-base font-medium text-lime-accent tabular-nums">₹{paymentInfo?.default_total_fee?.toLocaleString('en-IN') || '5,000'}</span>
            </div>
            <div className="bg-charcoal-card/40 p-4 rounded-card border border-charcoal-border/50">
              <span className="block text-xs uppercase tracking-wider text-charcoal-muted mb-1 font-mono">Registration</span>
              <span className="text-sm sm:text-base font-medium text-status-success flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success"></span>
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EVENT DETAILS SECTION */}
      <section id="event-details" className="py-24 bg-[#101213] border-b border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Editorial Briefing</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-ivory">The Runway Experience</h2>
            </div>
            <p className="text-charcoal-muted max-w-md text-sm leading-relaxed">
              Curated for aspiring and seasoned models seeking career visibility, high-fashion portfolio shoots, and industry jury exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-charcoal-card border border-charcoal-border rounded-card p-8 flex flex-col justify-between hover:border-lime-accent/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-btn bg-charcoal-surface border border-charcoal-border flex items-center justify-center text-lime-accent mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl text-ivory mb-3">Runway Showcase</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">
                  Walk in curated designer outfits before celebrated industry directors, talent scouts, and fashion media photographers.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-charcoal-border text-xs text-lime-accent font-mono">
                Category: Runway Model
              </div>
            </div>

            <div className="bg-charcoal-card border border-charcoal-border rounded-card p-8 flex flex-col justify-between hover:border-lime-accent/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-btn bg-charcoal-surface border border-charcoal-border flex items-center justify-center text-lime-accent mb-6">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl text-ivory mb-3">Portfolio & Coverage</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">
                  High-definition runway photographs and backstage reels archived directly in Cloudflare R2 private storage for participant access.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-charcoal-border text-xs text-lime-accent font-mono">
                Asset Resolution: 4K Editorial
              </div>
            </div>

            <div className="bg-charcoal-card border border-charcoal-border rounded-card p-8 flex flex-col justify-between hover:border-lime-accent/30 transition-all">
              <div>
                <div className="w-12 h-12 rounded-btn bg-charcoal-surface border border-charcoal-border flex items-center justify-center text-lime-accent mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl text-ivory mb-3">Verified Accreditation</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">
                  Official digital entry pass with secure QR verification code, verified payments record, and certificate of participation.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-charcoal-border text-xs text-lime-accent font-mono">
                Accreditation: Skyra Official
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP REGISTRATION PROCESS */}
      <section className="py-24 bg-charcoal border-b border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Participant Journey</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-ivory mb-4">Registration & Verification</h2>
            <p className="text-charcoal-muted text-sm">
              Our transparent 5-step registration and bank reconciliation workflow guarantees verified slots without automated gateway surcharges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((st, i) => (
              <div 
                key={st.step} 
                className="bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-between hover:border-lime-accent/40 transition-all relative group"
              >
                <div>
                  <span className="font-editorial text-4xl text-lime-accent/40 group-hover:text-lime-accent transition-colors block mb-4">
                    {st.step}
                  </span>
                  <h4 className="font-medium text-ivory text-base mb-2">{st.title}</h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">{st.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-charcoal-border/50 flex items-center text-[11px] text-charcoal-muted group-hover:text-lime-accent font-mono transition-colors">
                  <span>Step {i + 1} of 5</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setActiveTab('register')}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-btn bg-lime-accent text-charcoal font-semibold text-sm uppercase tracking-wide hover:bg-[#c9f556] transition-all shadow-lime-glow"
            >
              <span>Begin Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SKYRA CREATIONS */}
      <section className="py-24 bg-[#101213] border-b border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">The Brand</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-ivory mb-6 leading-tight">
                Crafting Modern Runway Standards with Precision
              </h2>
              <div className="space-y-4 text-charcoal-muted text-sm sm:text-base leading-relaxed">
                <p>
                  SKYRA CREATIONS is an event management and fashion production house dedicated to elevating contemporary runway talent. We bridge creative vision, structured backstage production, and authentic participant empowerment.
                </p>
                <p>
                  Our operational platform operates with full financial transparency: every participant receives an individualized Registration ID, clear installment schedules, and direct access to their accredited digital pass.
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-charcoal-border grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="block font-editorial text-3xl text-lime-accent">100%</span>
                  <span className="text-xs text-charcoal-muted">Bank Verified</span>
                </div>
                <div>
                  <span className="block font-editorial text-3xl text-ivory">Tier-1</span>
                  <span className="text-xs text-charcoal-muted">Cloudflare R2 Storage</span>
                </div>
                <div>
                  <span className="block font-editorial text-3xl text-ivory">Direct</span>
                  <span className="text-xs text-charcoal-muted">UPI Settlement</span>
                </div>
              </div>
            </div>

            {/* Visual Art Block */}
            <div className="bg-charcoal-card border border-charcoal-border rounded-section p-8 relative overflow-hidden shadow-luxury">
              <div className="aspect-[4/3] rounded-card bg-charcoal-surface border border-charcoal-border/70 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-lime-accent/10 border border-lime-accent/30 flex items-center justify-center text-lime-accent mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <span className="font-editorial text-3xl text-ivory font-light italic mb-2">SKYRA CREATIONS</span>
                <p className="text-xs text-charcoal-muted max-w-xs font-mono">
                  Official Runway Showcase 2026 • Curated Production
                </p>
                <div className="mt-6 flex items-center space-x-2 text-xs text-lime-accent">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Identity & Accreditation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL GALLERY PRESENTATION */}
      <section className="py-24 bg-charcoal border-b border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Visual Showcase</span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-ivory">Editorial Runway Archive</h2>
            </div>
            <p className="text-charcoal-muted max-w-sm text-sm">
              Atmospheric moments from production staging, rehearsal runs, and high-fashion presentations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="aspect-[3/4] bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-end relative overflow-hidden group hover:border-lime-accent/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal/40 to-transparent"></div>
              <div className="relative z-10">
                <span className="text-[11px] font-mono text-lime-accent uppercase tracking-wider block mb-1">Look 01</span>
                <h4 className="font-editorial text-2xl text-ivory mb-1">Couture Silhouettes</h4>
                <p className="text-xs text-charcoal-muted">Experimental drape & sculptural lines</p>
              </div>
            </div>

            <div className="aspect-[3/4] bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-end relative overflow-hidden group hover:border-lime-accent/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal/40 to-transparent"></div>
              <div className="relative z-10">
                <span className="text-[11px] font-mono text-lime-accent uppercase tracking-wider block mb-1">Look 02</span>
                <h4 className="font-editorial text-2xl text-ivory mb-1">The Walk & Poise</h4>
                <p className="text-xs text-charcoal-muted">Masterclass choreography on the center runway</p>
              </div>
            </div>

            <div className="aspect-[3/4] bg-charcoal-card border border-charcoal-border rounded-card p-6 flex flex-col justify-end relative overflow-hidden group hover:border-lime-accent/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal/40 to-transparent"></div>
              <div className="relative z-10">
                <span className="text-[11px] font-mono text-lime-accent uppercase tracking-wider block mb-1">Look 03</span>
                <h4 className="font-editorial text-2xl text-ivory mb-1">Backstage Lighting</h4>
                <p className="text-xs text-charcoal-muted">Behind-the-scenes precision before the curtains rise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="py-24 bg-[#101213] border-b border-charcoal-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Participant Inquiries</span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-normal text-ivory mb-4">Frequently Asked Questions</h2>
            <p className="text-charcoal-muted text-sm">
              Everything you need to know about fees, payment verification, and event day guidelines.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-charcoal-card border border-charcoal-border rounded-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-charcoal-surface/60 transition-colors"
                  >
                    <span className="font-medium text-base text-ivory pr-4">{faq.q}</span>
                    <span className="text-lime-accent">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-charcoal-muted leading-relaxed border-t border-charcoal-border/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CTA STRIP */}
      <section className="py-20 bg-charcoal relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-editorial text-4xl sm:text-6xl font-normal text-ivory mb-6">
            Ready to Take the Runway?
          </h2>
          <p className="text-charcoal-muted text-base max-w-xl mx-auto mb-8 font-light">
            Secure your slot today with initial advance registration. Verification opens immediately upon submission.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-btn bg-lime-accent text-charcoal font-semibold text-sm uppercase tracking-wide hover:bg-[#c9f556] transition-all shadow-lime-glow flex items-center justify-center space-x-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className="w-full sm:w-auto px-8 py-4 rounded-btn bg-charcoal-surface border border-charcoal-border text-ivory text-sm uppercase tracking-wide hover:bg-charcoal-card transition-all"
            >
              <span>Check Existing Pass</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
