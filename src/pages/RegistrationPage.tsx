import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getPaymentInfo, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo } from '../types/index';

interface RegistrationPageProps {
  setActiveTab: (tab: string) => void;
  setLookupRegId?: (id: string) => void;
}

export default function RegistrationPage({ setActiveTab, setLookupRegId }: RegistrationPageProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRegId, setCopiedRegId] = useState(false);
  const [successResult, setSuccessResult] = useState<{ reg_id: string; message: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2002-08-15');
  const [gender, setGender] = useState('Female');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [category, setCategory] = useState('Runway Model');
  const [height, setHeight] = useState('');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('');

  // Payment Selection
  const [paymentOption, setPaymentOption] = useState<'advance_2000' | 'advance_1500' | 'full'>('advance_2000');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [decl1, setDecl1] = useState(true);
  const [decl2, setDecl2] = useState(true);

  useEffect(() => {
    getPaymentInfo()
      .then(data => setPaymentInfo(data))
      .catch(err => console.error("Error loading payment info", err));
  }, []);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobile(val);
    if (sameAsMobile) {
      setWhatsapp(val);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Screenshot file size exceeds 10 MB limit.');
        return;
      }
      setScreenshotFile(file);
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyUpiId = () => {
    const id = paymentInfo?.upi_id || 'mr.death4646@oksbi';
    navigator.clipboard.writeText(id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const copyRegistrationKey = () => {
    if (!successResult?.reg_id) return;
    navigator.clipboard.writeText(successResult.reg_id);
    setCopiedRegId(true);
    setTimeout(() => setCopiedRegId(false), 2200);
  };

  const getEffectiveAmount = () => {
    if (paymentOption === 'full') return 5000;
    if (paymentOption === 'advance_1500') return 1500;
    return 2000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!decl1 || !decl2) {
      setErrorMsg('Please confirm both casting declaration checkboxes to proceed.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload your payment screenshot proof.');
      return;
    }
    if (!transactionId.trim()) {
      setErrorMsg('Please enter your 12-digit UPI Transaction ID / UTR.');
      return;
    }

    try {
      setLoading(true);
      setUploadPercent(0);
      setUploadStatusText('Transmitting proof to Cloudflare R2 storage...');

      // 1. Direct browser-to-Cloudflare R2 presigned upload
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(percent);
      });

      setUploadStatusText('Recording registration in Supabase PostgreSQL...');

      // 2. Submit record to serverless function
      const res = await registerContestant({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        dob: dob.trim(),
        gender: gender.trim(),
        mobile: mobile.trim(),
        whatsapp: sameAsMobile ? mobile.trim() : whatsapp.trim(),
        city: `${city.trim()}, ${country.trim()}`,
        category,
        height: height.trim() || null,
        instagram: instagram.trim() || null,
        experience: experience.trim() || null,
        amount: getEffectiveAmount(),
        transaction_id: transactionId.trim(),
        r2_object_key: objectKey,
        terms_confirmed: true,
      });

      setSuccessResult({
        reg_id: res.reg_id,
        message: res.message,
      });

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#d7ff74', '#c6f258', '#e2e2e5']
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration.');
    } finally {
      setLoading(false);
      setUploadStatusText('');
    }
  };

  // ==========================================
  // SCREEN 03: REGISTRATION SUCCESS VIEW
  // ==========================================
  if (successResult) {
    return (
      <div className="flex flex-col w-full px-margin-mobile pb-space-xl max-w-2xl mx-auto pt-6 text-on-surface">
        <div className="relative w-full flex flex-col items-center pt-space-lg text-center">
          {/* 1. Success Badge */}
          <div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-surface-container-high shadow-sm mb-space-md">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
              Application Successfully Lodged
            </span>
          </div>

          {/* 2. Editorial Headline */}
          <h2 className="font-headline-lg-mobile text-2xl sm:text-3xl text-on-surface tracking-tight max-w-sm mb-space-xs font-headline-lg">
            Welcome to the Selection Pool
          </h2>
          <p className="font-body-md text-sm text-secondary max-w-sm mb-space-lg">
            Your submission has been catalogued for the Skyra Creations Runway Audition.
          </p>

          {/* 3. Digital Casting Card */}
          <div className="w-full bg-surface-container-low rounded-xl shadow-md p-space-md text-left relative overflow-hidden mb-space-md border border-surface-variant/40">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>

            {/* Card Top Bar */}
            <div className="flex items-center justify-between gap-space-sm mb-space-md">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Casting Dossier</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="font-label-caps text-[10px] text-on-surface-variant font-medium">Awaiting Initial Payment Verification</span>
              </div>
            </div>

            {/* Participant Details Header */}
            <div className="flex items-center gap-space-md mb-space-md">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 border border-surface-variant">
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Screenshot proof" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold">SC</div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-label-caps text-label-caps text-outline uppercase">Candidate</p>
                <p className="font-headline-sm text-lg text-on-surface truncate font-semibold">{fullName}</p>
                <p className="font-body-sm text-xs text-secondary truncate">{category} — {city || 'Runway Division'}</p>
              </div>
            </div>

            {/* Inner Key-Value Matrix */}
            <div className="space-y-space-sm bg-surface-container rounded-lg p-space-sm mb-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Registration Key</span>
                  <span className="font-data-mono text-sm text-primary font-medium tracking-wide">{successResult.reg_id}</span>
                </div>
                <button
                  onClick={copyRegistrationKey}
                  aria-label="Copy registration number"
                  className="w-8 h-8 rounded bg-surface-container-highest hover:bg-surface-bright flex items-center justify-center text-on-surface transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-base">
                    {copiedRegId ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              <div className="w-full h-[1px] bg-surface-variant/40"></div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-label-caps text-outline uppercase">Amount Deposited</span>
                <span className="font-data-mono text-primary font-bold">₹{getEffectiveAmount().toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-label-caps text-outline uppercase">UTR / Reference</span>
                <span className="font-data-mono text-secondary font-mono">{transactionId}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-label-caps text-outline uppercase">Casting Ward</span>
                <span className="font-body-sm text-on-surface">Atelier Skyra — Central Stage</span>
              </div>
            </div>

            {/* Micro-Security Badge */}
            <div className="flex items-center justify-between px-space-xs pt-space-xs text-outline text-[11px]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-primary">verified</span>
                <span className="font-label-caps">Cryptographic Verification Token Valid</span>
              </div>
              <span className="font-data-mono opacity-60">ID #{successResult.reg_id.replace(/[^0-9]/g, '')}</span>
            </div>
          </div>

          {/* 4. Disclaimer Banner */}
          <div className="w-full bg-surface-container-high rounded-lg p-space-md mb-space-lg flex items-start gap-space-sm text-left border border-surface-variant/40">
            <span className="material-symbols-outlined text-amber-400 text-lg flex-shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold">Note:</strong> Your registration is recorded, but final casting slot is reserved only upon bank statement verification.
            </p>
          </div>

          {/* 5. Next Steps Roadmap */}
          <div className="w-full text-left mb-space-lg">
            <div className="flex items-center justify-between mb-space-md">
              <h3 className="font-label-caps text-label-caps text-outline uppercase tracking-wider">Accreditation Protocol</h3>
              <span className="font-label-caps text-label-caps text-primary">Stage 1 of 3</span>
            </div>
            <div className="space-y-space-sm">
              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container shadow-sm">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-on-primary font-bold text-xs">
                  01
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-subheading text-sm text-on-surface font-medium">Complete Settlement</p>
                  <p className="font-body-sm text-xs text-secondary mt-0.5">
                    Pay advance or full fee to lock your slot in the runway roster.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low shadow-sm border border-surface-variant/30">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-secondary font-bold text-xs">
                  02
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-subheading text-sm text-on-surface font-medium">Manual Bank Reconciliation</p>
                  <p className="font-body-sm text-xs text-secondary mt-0.5">
                    Administrative manual reconciliation against bank statements (typically 2-24 hours).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low shadow-sm border border-surface-variant/30">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-secondary font-bold text-xs">
                  03
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-subheading text-sm text-on-surface font-medium">Accreditation Release</p>
                  <p className="font-body-sm text-xs text-secondary mt-0.5">
                    Digital Call-up letter & backstage pass release directly to your account & WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Actions Stack */}
          <div className="w-full flex flex-col items-center gap-space-sm">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('balance');
              }}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-xs font-semibold tracking-wide flex items-center justify-center gap-space-xs transition-colors shadow-md active:scale-[0.99] uppercase"
            >
              <span>Complete Balance Payment Now</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            <button
              onClick={() => setActiveTab('landing')}
              className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-xs font-medium tracking-wide flex items-center justify-center transition-colors active:scale-[0.99] uppercase"
            >
              <span>Return to Event Homepage</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 02: REGISTRATION FORM VIEW
  // ==========================================
  return (
    <div className="flex flex-col w-full pb-16 max-w-3xl mx-auto pt-6 text-on-surface">
      <div className="px-margin-mobile">
        {/* Editorial Step Indicator */}
        <div className="flex items-center justify-between gap-space-xs mb-space-lg">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-1 bg-primary rounded-full transition-all duration-300"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">01 Profile</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-1 bg-surface-container-high rounded-full"></div>
            <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase opacity-60">02 Portfolio</span>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-1 bg-surface-container-high rounded-full"></div>
            <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase opacity-60">03 Verify</span>
          </div>
        </div>

        {/* Editorial Header Block */}
        <div className="flex flex-col gap-space-xs mb-space-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Casting Season '26</span>
          </div>
          <h1 className="font-headline-lg-mobile text-2xl sm:text-4xl text-on-surface tracking-tight font-headline-lg">
            Participant Registration
          </h1>
          <p className="font-body-md text-sm text-secondary max-w-md">
            Complete your luxury casting profile. Ensure all contact records and visual dimensions reflect pure authenticity.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mx-margin-mobile mb-6 p-4 rounded-xl bg-error-container/40 border border-error/40 text-on-error-container text-xs flex items-start gap-2">
          <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Print-Inspired Ivory Editorial Sheet */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
        <div className="mx-margin-mobile bg-tertiary text-on-tertiary-fixed rounded-xl p-space-md sm:p-space-lg shadow-xl flex flex-col gap-space-lg">
          {/* Section 1: Personal Profile Details */}
          <section className="flex flex-col gap-space-md">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-tertiary-container">Stage 01</span>
                <h2 className="font-headline-sm text-xl sm:text-2xl text-on-tertiary-fixed font-headline-sm">Personal Record</h2>
              </div>
              <span className="font-data-mono text-data-mono text-on-tertiary-container tracking-wider uppercase text-xs">Mandatory</span>
            </div>

            {/* Full Legal Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="legal-name">
                Full Legal Name <span className="text-on-primary-container">*</span>
              </label>
              <div className="relative">
                <input
                  id="legal-name"
                  type="text"
                  required
                  placeholder="e.g. Natalia Vodianova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
                <span className="material-symbols-outlined absolute right-3.5 top-3 text-secondary text-base">person</span>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="dob">
                Date of Birth <span className="text-on-primary-container">*</span>
              </label>
              <div className="relative">
                <input
                  id="dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface font-body-md text-sm rounded-lg focus:outline-none shadow-inner [color-scheme:dark]"
                />
                <span className="material-symbols-outlined absolute right-3.5 top-3 text-secondary text-base pointer-events-none">calendar_today</span>
              </div>
            </div>

            {/* Gender Selection Pills */}
            <div className="flex flex-col gap-2">
              <span className="font-label-caps text-label-caps uppercase text-on-tertiary-container">Identity & Runway Division</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Female', 'Male', 'Non-Binary', 'Gender Fluid'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex items-center justify-between px-3 h-10 rounded-lg font-label-md text-xs transition-all ${
                      gender === g
                        ? 'bg-surface text-on-surface shadow-sm font-semibold'
                        : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80'
                    }`}
                  >
                    <span>{g}</span>
                    <span className={`material-symbols-outlined text-sm ${gender === g ? 'text-primary' : 'opacity-0'}`}>
                      check_circle
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile & WhatsApp */}
            <div className="flex flex-col gap-2.5">
              <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="contact-phone">
                Direct Telephone <span className="text-on-primary-container">*</span>
              </label>
              <div className="flex gap-2">
                <div className="w-24 bg-surface text-on-surface rounded-lg flex items-center justify-between px-3 h-11 shrink-0 text-xs font-data-mono">
                  <span>+91</span>
                  <span className="material-symbols-outlined text-xs text-secondary">expand_more</span>
                </div>
                <input
                  id="contact-phone"
                  type="tel"
                  required
                  placeholder="98200 45678"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="flex-1 h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const next = !sameAsMobile;
                    setSameAsMobile(next);
                    if (next) setWhatsapp(mobile);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    sameAsMobile ? 'bg-primary text-on-primary' : 'bg-tertiary-container text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                </button>
                <span className="font-body-sm text-xs text-on-tertiary-container select-none">
                  Same number on WhatsApp for callbacks
                </span>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="email-address">
                Primary Agency / Personal Email <span className="text-on-primary-container">*</span>
              </label>
              <div className="relative">
                <input
                  id="email-address"
                  type="email"
                  required
                  placeholder="natalia@skyramodels.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
                <span className="material-symbols-outlined absolute right-3.5 top-3 text-secondary text-base">alternate_email</span>
              </div>
            </div>

            {/* Residence */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="res-city">
                  City <span className="text-on-primary-container">*</span>
                </label>
                <input
                  id="res-city"
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container" htmlFor="res-country">
                  Country
                </label>
                <input
                  id="res-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
              </div>
            </div>
          </section>

          {/* Visual Divider */}
          <div className="w-full h-[1px] bg-tertiary-container"></div>

          {/* Section 2: Portfolio Visuals & Runway Category */}
          <section className="flex flex-col gap-space-md">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-tertiary-container">Stage 02</span>
                <h2 className="font-headline-sm text-xl sm:text-2xl text-on-tertiary-fixed font-headline-sm">Photographic Tests & Category</h2>
              </div>
              <span className="font-data-mono text-data-mono text-on-tertiary-container tracking-wider uppercase text-xs">Accreditation</span>
            </div>

            {/* Guidelines Callout Box */}
            <div className="bg-tertiary-container rounded-lg p-space-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-on-tertiary-fixed text-lg shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-on-tertiary-fixed font-bold tracking-wider">Casting Protocol</span>
                <p className="font-body-sm text-xs text-on-tertiary-container leading-relaxed">
                  Natural daylight, minimal makeup, sleek hair, and dark fitted clothing strongly required for stage jury review.
                </p>
              </div>
            </div>

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container">Contestant Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3.5 bg-surface text-on-surface font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
              >
                <option value="Runway Model">Runway Model (Adults / Open)</option>
                <option value="Teen / Fresher Runway">Teen / Fresher Runway</option>
                <option value="Kids Runway">Kids Runway Category</option>
                <option value="Designer Collection Showcase">Designer Collection Showcase</option>
              </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container">Height (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 5ft 9in / 175 cm"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps uppercase text-on-tertiary-container">Instagram / Handle</label>
                <input
                  type="text"
                  placeholder="@portfolio_handle"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full h-11 px-3.5 bg-surface text-on-surface placeholder:text-outline font-body-md text-sm rounded-lg focus:outline-none shadow-inner"
                />
              </div>
            </div>
          </section>

          {/* Visual Divider */}
          <div className="w-full h-[1px] bg-tertiary-container"></div>

          {/* Section 3: Legal & Declarations */}
          <section className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-tertiary-container">Stage 03: Declaration</span>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={decl1}
                onChange={(e) => setDecl1(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
              />
              <span className="font-body-sm text-xs text-on-tertiary-fixed leading-tight">
                I declare that all submitted personal measurements, contact details, and test images are authentic and current.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={decl2}
                onChange={(e) => setDecl2(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
              />
              <span className="font-body-sm text-xs text-on-tertiary-fixed leading-tight">
                I agree to the <span className="underline font-semibold cursor-pointer">SKYRA CREATIONS Casting Regulations</span> and Terms of Worldwide Participation.
              </span>
            </label>
          </section>
        </div>

        {/* Section 4: Manual UPI Payment Card */}
        <div className="mx-margin-mobile bg-surface-container rounded-xl p-space-md sm:p-space-lg shadow-md border border-surface-variant/40 flex flex-col gap-space-md">
          <div className="flex items-baseline justify-between border-b border-surface-variant/40 pb-3">
            <div>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Stage 04</span>
              <h2 className="font-headline-sm text-xl sm:text-2xl text-on-surface">Payment & Verification Proof</h2>
            </div>
            <span className="font-data-mono text-primary text-xs uppercase">Zero Surcharge</span>
          </div>

          {/* Payment Option Selector */}
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-xs uppercase text-secondary">Select Advance / Settlement Option</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('advance_2000')}
                className={`p-3 rounded-lg text-left transition-all border ${
                  paymentOption === 'advance_2000'
                    ? 'border-primary bg-surface-container-high text-on-surface'
                    : 'border-surface-variant bg-surface text-secondary hover:border-outline'
                }`}
              >
                <span className="font-label-caps text-[10px] text-primary uppercase block">Standard Advance</span>
                <span className="font-headline-sm text-base text-on-surface font-semibold">₹2,000</span>
                <span className="text-[11px] text-secondary block mt-0.5">Remaining ₹3,000 later</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('advance_1500')}
                className={`p-3 rounded-lg text-left transition-all border ${
                  paymentOption === 'advance_1500'
                    ? 'border-primary bg-surface-container-high text-on-surface'
                    : 'border-surface-variant bg-surface text-secondary hover:border-outline'
                }`}
              >
                <span className="font-label-caps text-[10px] text-secondary uppercase block">Initial Advance</span>
                <span className="font-headline-sm text-base text-on-surface font-semibold">₹1,500</span>
                <span className="text-[11px] text-secondary block mt-0.5">Remaining ₹3,500 later</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('full')}
                className={`p-3 rounded-lg text-left transition-all border ${
                  paymentOption === 'full'
                    ? 'border-primary bg-surface-container-high text-on-surface'
                    : 'border-surface-variant bg-surface text-secondary hover:border-outline'
                }`}
              >
                <span className="font-label-caps text-[10px] text-primary uppercase block">Full Clearance</span>
                <span className="font-headline-sm text-base text-on-surface font-semibold">₹5,000</span>
                <span className="text-[11px] text-secondary block mt-0.5">Instant complete clearance</span>
              </button>
            </div>
          </div>

          {/* QR Code & Payee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-surface-container-low p-4 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest mb-2">Scan & Settle</span>
              <div className="w-44 h-44 bg-white p-2 rounded-lg shadow flex items-center justify-center">
                <img
                  src={paymentInfo?.qr_code_url || "/qr_code.png"}
                  alt="Skyra Creations UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-data-mono text-[10px] text-secondary mt-1">Google Pay • PhonePe • Paytm</span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-3 bg-surface rounded-lg">
                <span className="font-label-caps text-[10px] text-outline uppercase block">Official UPI ID</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-data-mono text-primary font-bold">{paymentInfo?.upi_id || "mr.death4646@oksbi"}</span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="p-1 rounded bg-surface-container-high text-on-surface hover:text-primary"
                    title="Copy UPI ID"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedUpi ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-secondary mt-1 block">Payee: {paymentInfo?.upi_name || "Sanjay Mass"}</span>
              </div>

              <div className="p-3 bg-surface rounded-lg flex justify-between items-center">
                <span className="text-secondary">Amount to transfer:</span>
                <span className="font-headline-sm text-lg text-primary font-bold">₹{getEffectiveAmount().toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* UTR & Proof Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-xs uppercase text-secondary">Bank UTR / Reference ID *</label>
              <input
                type="text"
                required
                placeholder="12-digit number from payment receipt"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full h-11 px-3.5 bg-surface text-on-surface font-data-mono text-sm rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-xs uppercase text-secondary">Payment Screenshot *</label>
              <label className="cursor-pointer flex items-center justify-center h-11 px-3.5 rounded-lg bg-surface border border-dashed border-outline-variant hover:border-primary transition-colors text-xs text-secondary truncate">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <span className="material-symbols-outlined text-base mr-2 text-primary">upload</span>
                <span className="truncate">{screenshotFile ? screenshotFile.name : 'Choose screenshot (Max 10MB)'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Floating Call-To-Action Container */}
        <div className="px-margin-mobile flex flex-col gap-space-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Casting Assessment Fee</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                ₹{getEffectiveAmount().toLocaleString('en-IN')} <span className="font-body-sm text-xs text-secondary font-normal">incl. taxes</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">Encrypted</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary hover:bg-primary-fixed rounded-lg flex items-center justify-between px-space-md text-on-primary transition-all duration-200 active:scale-[0.99] shadow-lg disabled:opacity-50"
          >
            <span className="font-label-md text-label-md tracking-wider uppercase font-bold text-on-primary">
              {loading ? `${uploadStatusText} (${uploadPercent}%)` : 'Submit Registration & Settle'}
            </span>
            <div className="flex items-center gap-1">
              <span className="font-data-mono text-data-mono text-on-primary font-semibold">₹{getEffectiveAmount()}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
