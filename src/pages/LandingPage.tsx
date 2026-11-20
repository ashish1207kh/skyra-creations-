import React, { useState } from 'react';
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

  const experienceCards = [
    {
      phase: 'PHASE // 01',
      title: 'Elite Open Casting',
      icon: 'center_focus_strong',
      desc: 'Direct evaluation by Paris and Milan casting directors with real-time digital polaroid review sessions.',
      tags: ['Catwalk Walk', 'Book Review'],
    },
    {
      phase: 'PHASE // 02',
      title: 'Couture Masterclass',
      icon: 'straighten',
      desc: 'Intensive poise, choreography, and backstage protocol guided by legendary runway trainers and stylists.',
      tags: ['Posture & Pacing', 'Lighting Sync'],
    },
    {
      phase: 'PHASE // 03',
      title: 'Agency Spotlights',
      icon: 'globe_asia',
      desc: 'Private scouting salon connects finalists directly with premier European and North American agencies.',
      tags: ['Representation', 'Lookbook Deal'],
    },
  ];

  const protocolSteps = [
    {
      num: '01',
      title: 'Online Identity',
      desc: 'Submit structural metrics, agency history, and verified contact profiles.',
      badge: 'check_circle',
      isBadgeIcon: true,
    },
    {
      num: '02',
      title: 'Digital Portfolio Upload',
      desc: 'Unretouched polaroids (profile, full-length, mid-bust, emotive motion clip).',
      badge: 'RAW / RAW+',
      isBadgeIcon: false,
    },
    {
      num: '03',
      title: 'Casting Verification Fee',
      desc: 'Covers official accreditation dossier, security credentials, and backstage pass.',
      badge: `₹${paymentInfo?.default_total_fee?.toLocaleString('en-IN') || '5,000'}`,
      isBadgeIcon: false,
    },
    {
      num: '04',
      title: 'Official Call-Up & Pass',
      desc: 'Encrypted QR pass pushed directly to your SKYRA wallet for stage access.',
      badge: 'Pass Issued',
      isBadgeIcon: false,
    },
  ];

  const faqs = [
    {
      q: 'Who is eligible for Season 2026 casting?',
      a: 'Open to both signed and independent models aged 17+. All genders and international applicants are welcome provided valid travel documentation is held for the runway venue.',
    },
    {
      q: 'What are the digital portfolio guidelines?',
      a: 'Submissions must include natural, non-filtered digital snapshots: one headshot, one profile view, and two full-length poses wearing fitted dark attire with minimal styling.',
    },
    {
      q: 'When are audition call-backs dispatched?',
      a: 'Official digital invites and scheduled time-slots are pushed within 24–72 hours of portfolio clearance directly into your SKYRA portal dashboard.',
    },
    {
      q: 'How are fees and accreditation processed?',
      a: 'Verification payments are encrypted and manual bank statement reconciled. Slots are locked upon initial advance verification, with remaining balances settled prior to stage briefing.',
    },
  ];

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface min-h-screen pb-20">
      {/* 1. Hero Editorial Frame */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest">
        <div className="relative w-full min-h-[520px] sm:min-h-[620px] flex items-end">
          {/* Background image */}
          <img 
            alt="Haute couture runway model walking beneath architectural directional spotlight" 
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKeZflp9UikHo-HozhgG8VYrRbUyHe5lqDYK0xT6GgClkNjfRgqksyHxqdmbqv_tVnbQbxdvO1fcUgiIrwMwqzZ3RiNuj2Lbo6wvB-4gpiZ45nHi893Jltg4UvO4ARkQHPNDTRCtnsHPB1Cm4-zLzcSNRNP_PDXaDKaA_ONlhjXpHAyfzsI95-f5uIeeGjQCaIleGALfrZIDEeADHk2XNvssbGQrOBA4SDphLbrkY"
          />

          {/* Editorial Radial & Linear Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-surface-dim/70 via-transparent to-surface-dim/40"></div>

          {/* Top Live Dispatch Bar Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none max-w-7xl mx-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-data-mono uppercase text-primary tracking-widest text-[10px]">Casting Window Live</span>
            </div>
            <span className="font-data-mono text-secondary text-[11px] tracking-widest px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md">
              PARIS // MILAN
            </span>
          </div>

          {/* Hero Typography Anchor */}
          <div className="relative z-10 p-5 sm:p-10 max-w-4xl mx-auto w-full flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-surface-variant/90 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
                EDITION 2026 // RUNWAY COUTURE
              </span>
            </div>

            <h1 className="font-headline-lg-mobile text-3xl sm:text-6xl text-on-surface tracking-tight leading-[1.08] font-headline-lg">
              OWN THE STAGE.<br/>
              <span className="italic font-headline-md text-tertiary">DEFINE THE MOMENT.</span>
            </h1>

            <p className="font-body-md text-sm sm:text-base text-secondary max-w-md leading-relaxed">
              Where confidence meets creativity. Step into the next chapter of <span className="text-on-surface font-medium">SKYRA CREATIONS</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => setActiveTab('register')}
                className="h-11 px-6 flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary font-label-md text-label-md tracking-wider uppercase transition-transform active:scale-[0.98] shadow-md hover:bg-primary-fixed"
              >
                <span>Register Now</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>

              <a 
                href="#experience"
                className="h-11 px-6 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md tracking-wider uppercase hover:bg-surface-bright transition-colors"
              >
                Explore
              </a>

              <button 
                onClick={() => setActiveTab('balance')}
                className="h-11 px-6 flex items-center justify-center gap-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md tracking-wider uppercase hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>Balance Portal</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Monolithic Stats Strip */}
      <section className="w-full px-4 py-8 bg-surface max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-2 p-4 sm:p-6 rounded-xl bg-surface-container-low shadow-sm">
          <div className="flex flex-col items-center text-center">
            <span className="font-display-xl-mobile sm:text-5xl text-3xl text-primary tracking-tight font-headline-lg">350+</span>
            <span className="font-label-caps text-[10px] sm:text-xs uppercase text-secondary tracking-widest mt-1">Models Cast</span>
          </div>
          <div className="flex flex-col items-center text-center border-x-0 bg-surface-container/40 rounded-lg py-1">
            <span className="font-display-xl-mobile sm:text-5xl text-3xl text-on-surface tracking-tight font-headline-lg">24</span>
            <span className="font-label-caps text-[10px] sm:text-xs uppercase text-secondary tracking-widest mt-1">Haute Houses</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="font-display-xl-mobile sm:text-5xl text-3xl text-primary tracking-tight font-headline-lg">1.2M</span>
            <span className="font-label-caps text-[10px] sm:text-xs uppercase text-secondary tracking-widest mt-1">Live Reach</span>
          </div>
        </div>
      </section>

      {/* 3. The Runway Experience */}
      <section className="w-full px-4 py-8 flex flex-col gap-6 bg-surface max-w-7xl mx-auto" id="experience">
        <div className="flex flex-col gap-1.5">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Curated Access</span>
          <h2 className="font-headline-md text-2xl sm:text-4xl text-on-surface">The Runway Experience</h2>
          <p className="font-body-sm text-sm text-secondary">Engineered for transcendent discovery. From scouting calls to worldwide broadcast syndication.</p>
        </div>

        {/* Experience Cards Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceCards.map((card, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-xl bg-surface-container flex flex-col justify-between gap-4 transition-all hover:bg-surface-container-high border border-surface-variant/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>
                  <span className="font-data-mono text-xs text-secondary tracking-widest">{card.phase}</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface mb-2">{card.title}</h3>
                <p className="font-body-sm text-sm text-secondary leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-surface-variant/30">
                {card.tags.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-data-mono text-[10px] tracking-wider uppercase">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Registration Steps Flow */}
      <section className="w-full px-4 py-10 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">The Protocol</span>
            <h2 className="font-headline-md text-2xl sm:text-4xl text-on-surface">Registration Process</h2>
            <p className="font-body-sm text-sm text-secondary">Four measured milestones to qualify for the 2026 runway circuit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {protocolSteps.map((step) => (
              <div key={step.num} className="flex flex-col gap-3 p-5 rounded-xl bg-surface-container-low border border-surface-variant/30">
                <div className="flex items-center justify-between">
                  <span className="font-data-mono text-data-mono text-primary font-bold px-2.5 py-1 rounded bg-surface-container">
                    {step.num}
                  </span>
                  {step.isBadgeIcon ? (
                    <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  ) : (
                    <span className="font-data-mono text-[10px] text-primary tracking-widest uppercase px-2 py-0.5 rounded bg-surface-container">
                      {step.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-subheading text-base text-on-surface font-semibold mb-1">{step.title}</h4>
                  <p className="font-body-sm text-xs text-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setActiveTab('register')}
              className="h-11 px-8 rounded-full bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 hover:bg-primary-fixed transition-all"
            >
              <span>Start Registration</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Curated Lookbook Gallery */}
      <section className="w-full px-4 py-10 bg-surface max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Lookbook Archive</span>
            <h2 className="font-headline-md text-2xl sm:text-4xl text-on-surface">Curated Visuals</h2>
          </div>
          <button 
            onClick={() => setActiveTab('register')}
            className="font-label-md text-xs text-primary flex items-center gap-1 uppercase tracking-wider hover:underline"
          >
            <span>Audition Roster</span>
            <span className="material-symbols-outlined text-sm">north_east</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container">
              <img 
                alt="Editorial close-up fashion photograph of an avant-garde model" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAjxJBqSnk2Nl9R-X4atighBY7ZNZHHtPoGZLC6KBi1Ku8SQpqOaTa85B-wyJQKRc94VK2c-HQNMHPsWGIwDh5harIhbk5AX_4fLnJ6A0YNCY4AT22g1mJ69851I66gFamX7XJ0JQnFgjnTN6jIPmWQXHxhteh3ACBrSckjKo-imu-s54RAlY42huI6a6kTz1UIsjZU7XSjG9C_nudKrOLMGS6zZNNEnUdoAoJjas"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
                <span className="font-data-mono text-[10px] text-on-surface tracking-wider uppercase">Look 01 // Vesper</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline px-0.5">
              <span className="font-subheading text-[13px] text-on-surface font-medium truncate">Maison de L'Ombre</span>
              <span className="font-data-mono text-[11px] text-secondary">AW26</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container">
              <img 
                alt="High fashion runway shot of a tall model in sheer architectural pleated organza gown" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiuBlGmp5YFREy6Y_uxsMz_jTb23gtcSUk8efblW64BtjEzsDW0R1R1_LuL826mV1PAsKA2qNX2XFimBra8oVIM2DiaUmcg3G9l6QvwkPeG12aWWKpjgINbSx6A3PbBRUockNhs9ILWC6Jy7lNhviI2why7wg8mVL5_b0QP3gKaamOUgVcaZ1m_El5Qer9zlGCJxyjWpJfouiZxi_mMN5TsZyDGmcz9jLoO0x1mPA"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md">
                <span className="font-data-mono text-[10px] text-on-surface tracking-wider uppercase">Look 04 // Kinetic</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline px-0.5">
              <span className="font-subheading text-[13px] text-on-surface font-medium truncate">Atelier Kaelen</span>
              <span className="font-data-mono text-[11px] text-secondary">SS26</span>
            </div>
          </div>
        </div>

        {/* Backstage Feature Banner */}
        <div className="mt-4 relative w-full aspect-[16/9] max-h-72 rounded-xl overflow-hidden bg-surface-container">
          <img 
            alt="Cinematic wide runway backstage photograph" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByRT__Ld8LPvee0wPVtjo6b7At7Zx8adNf86RpgNHVoooOtFufFWERi0popJa7sTYJkJL_JxdkQ61UVatVYzOm2Ws2h_2cUofHRmMK76Xe6SbcEckPpQ96R_8tN3hpYMjnlLyIc8iUVYu_qhjOGhEEb-lg6jjesVBZ6wzOYa6dY3W6R6rlrjKWYkB9sX2iEZ1FpkFLY31K5-Xxrit7zZcP0g47ItTJOZUlWF_rIB8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent flex flex-col justify-end p-5">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Behind The Runway</span>
            <h3 className="font-headline-sm text-xl text-on-surface mt-0.5">Backstage Synergy & Production</h3>
            <p className="font-body-sm text-xs text-secondary truncate">Exclusive access to couture dressers, head stylists, and runway direction.</p>
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion */}
      <section className="w-full px-4 py-10 bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-1 mb-6 text-center sm:text-left">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Inquiries</span>
            <h2 className="font-headline-md text-2xl sm:text-3xl text-on-surface">Frequently Asked Questions</h2>
            <p className="font-body-sm text-xs text-secondary">Everything required prior to physical check-in and stage audition.</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="rounded-xl bg-surface-container-low overflow-hidden border border-surface-variant/30">
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 flex items-center justify-between text-left focus:outline-none hover:bg-surface-container transition-colors"
                  >
                    <span className="font-subheading text-sm text-on-surface font-medium pr-2">{faq.q}</span>
                    <span className={`material-symbols-outlined text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-secondary font-body-sm text-xs leading-relaxed border-t border-surface-variant/20 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Closing Editorial Callout */}
      <section className="w-full px-4 pt-10 pb-12 bg-surface max-w-4xl mx-auto">
        <div className="relative p-6 sm:p-10 rounded-2xl bg-surface-container-high overflow-hidden flex flex-col items-center text-center gap-4 border border-surface-variant/40">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
          <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">SKYRA CREATIONS // ARCHIVE 2026</span>
          <h3 className="font-headline-lg-mobile text-2xl sm:text-4xl text-on-surface font-headline-lg">
            The Spotlight Awaits.
          </h3>
          <p className="font-body-sm text-xs sm:text-sm text-secondary max-w-sm">
            Limited slots remain for global runway casting. Secure your profile accreditation before submissions conclude.
          </p>

          <button 
            onClick={() => setActiveTab('register')}
            className="w-full sm:w-auto px-8 h-12 flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary font-label-md text-xs tracking-wider uppercase font-semibold transition-transform active:scale-[0.98] shadow-md hover:bg-primary-fixed"
          >
            <span>Apply for Season 2026</span>
            <span className="material-symbols-outlined text-lg">east</span>
          </button>

          <div className="flex items-center gap-4 text-secondary font-data-mono text-[11px] pt-1">
            <span>CURATED BY SKYRA</span>
            <span>•</span>
            <span>PARIS COUTURE WEEK</span>
          </div>
        </div>

        {/* Editorial Micro Footer */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-4 text-on-surface-variant font-label-caps text-[10px] tracking-widest uppercase">
            <span className="cursor-pointer hover:text-primary">Privacy Codex</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-primary">Casting Terms</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-primary">Press Accreditation</span>
          </div>
          <p className="font-data-mono text-[10px] text-secondary/60">
            © 2026 SKYRA CREATIONS INTERNATIONALE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </section>
    </div>
  );
}
