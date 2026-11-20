import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  Eye,
  Camera,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
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
  const [successResult, setSuccessResult] = useState<{ reg_id: string; message: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [genderOther, setGenderOther] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Runway Model');
  const [height, setHeight] = useState('');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('');

  // Payment
  const [paymentOption, setPaymentOption] = useState<'advance_2000' | 'advance_1500' | 'full'>('advance_2000');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

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

  const handleSameAsMobileToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsMobile(checked);
    if (checked) {
      setWhatsapp(mobile);
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

  const getEffectiveAmount = () => {
    if (paymentOption === 'full') return 5000;
    if (paymentOption === 'advance_1500') return 1500;
    return 2000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsConfirmed) {
      setErrorMsg('Please confirm the terms and conditions declaration.');
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

    const finalGender = gender === 'Other' ? (genderOther || 'Other') : gender;
    const finalAmount = getEffectiveAmount();

    try {
      setLoading(true);
      setUploadPercent(0);
      setUploadStatusText('Uploading payment proof to secure Cloudflare R2 storage...');

      // 1. Direct browser-to-Cloudflare R2 presigned upload
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(percent);
      });

      setUploadStatusText('Recording registration in database...');

      // 2. Submit record to Serverless Function
      const res = await registerContestant({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        dob: dob.trim(),
        gender: finalGender.trim(),
        mobile: mobile.trim(),
        whatsapp: sameAsMobile ? mobile.trim() : whatsapp.trim(),
        city: city.trim(),
        category,
        height: height.trim() || null,
        instagram: instagram.trim() || null,
        experience: experience.trim() || null,
        amount: finalAmount,
        transaction_id: transactionId.trim(),
        r2_object_key: objectKey,
        terms_confirmed: true,
      });

      setSuccessResult({
        reg_id: res.reg_id,
        message: res.message,
      });

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#B8E34B', '#FFFFFF', '#A5AAA5']
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration.');
    } finally {
      setLoading(false);
      setUploadStatusText('');
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-8 sm:p-12 shadow-luxury text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-charcoal-surface border border-lime-accent/40 text-lime-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lime-glow">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Registration Recorded</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-ivory mb-3">
            Welcome to SKYRA CREATIONS
          </h2>
          <p className="text-charcoal-muted text-sm max-w-md mx-auto mb-8 font-light">
            Your registration details and payment screenshot have been safely transmitted. Our team will verify your payment against bank credit.
          </p>

          <div className="bg-[#101213] border border-charcoal-border rounded-card p-6 max-w-md mx-auto mb-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-charcoal-border">
              <span className="text-xs uppercase tracking-wider text-charcoal-muted font-mono">Registration ID</span>
              <span className="font-mono text-lg font-bold text-lime-accent">{successResult.reg_id}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Contestant Name:</span>
              <span className="text-ivory font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Submitted Amount:</span>
              <span className="text-lime-accent font-semibold tabular-nums">₹{getEffectiveAmount().toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Transaction ID / UTR:</span>
              <span className="text-charcoal-muted font-mono text-xs">{transactionId}</span>
            </div>
            <div className="pt-3 flex justify-between items-center text-xs sm:text-sm border-t border-charcoal-border">
              <span className="text-charcoal-muted">Verification Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-pending/10 text-status-pending border border-status-pending/20">
                Pending Bank Verification
              </span>
            </div>
          </div>

          <div className="bg-charcoal-surface border border-charcoal-border rounded-card p-4 text-xs text-charcoal-muted max-w-md mx-auto mb-8 text-left">
            <p className="font-semibold text-ivory mb-1">Important Notice</p>
            <p>Please note your Registration ID <span className="text-lime-accent font-mono font-bold">({successResult.reg_id})</span>. It is required to pay your remaining balance and access your digital runway pass.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-btn bg-lime-accent text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-[#c9f556] transition-all flex items-center justify-center space-x-2 shadow-lime-glow"
            >
              <Eye className="w-4 h-4" />
              <span>View Pass & Timeline</span>
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setTransactionId('');
                setTermsConfirmed(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-btn bg-charcoal-surface border border-charcoal-border hover:bg-charcoal text-charcoal-muted hover:text-ivory text-xs uppercase tracking-wider transition-all"
            >
              New Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-charcoal-card border border-charcoal-border text-xs uppercase tracking-widest text-lime-accent mb-3 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Event Registration</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-ivory mb-3">
          SKYRA CREATIONS — RUNWAY SHOW
        </h1>
        <p className="text-charcoal-muted text-sm max-w-xl mx-auto font-light leading-relaxed">
          Please complete all required fields carefully. Non-refundable participation fee. Our coordination team contacts contestants through WhatsApp upon bank verification.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-card bg-status-rejected/10 border border-status-rejected/30 text-ivory text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-status-rejected shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-status-rejected">Registration Notice</p>
            <p className="text-charcoal-muted mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Personal Details */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              01
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Personal Information</h2>
              <p className="text-xs text-charcoal-muted">Used for participant identification and official accreditation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Full Legal Name <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjay Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
                />
              </div>
              <p className="text-[11px] text-charcoal-muted mt-1.5 font-light">Avoid nicknames. Name will appear on your participation certificate.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Email Address <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Date of Birth <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory focus:outline-none focus:border-lime-accent text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Gender <span className="text-lime-accent">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Female', 'Male', 'Other'].map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center p-3 rounded-input border cursor-pointer text-xs uppercase tracking-wider font-medium transition-all ${
                      gender === g
                        ? 'border-lime-accent bg-charcoal-surface text-lime-accent shadow-sm'
                        : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border hover:text-ivory'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={(e) => setGender(e.target.value)}
                      className="sr-only"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
              {gender === 'Other' && (
                <input
                  type="text"
                  placeholder="Please specify gender"
                  value={genderOther}
                  onChange={(e) => setGenderOther(e.target.value)}
                  className="mt-3 w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-2.5 text-ivory text-sm focus:outline-none focus:border-lime-accent"
                />
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Mobile Number <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono">
                  WhatsApp Number <span className="text-lime-accent">*</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-lime-accent cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={handleSameAsMobileToggle}
                    className="rounded border-charcoal-border bg-charcoal-dark text-lime-accent focus:ring-0"
                  />
                  <span>Same as Mobile</span>
                </label>
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-lime-accent" />
                <input
                  type="tel"
                  required
                  disabled={sameAsMobile}
                  placeholder="+91 98765 43210"
                  value={sameAsMobile ? mobile : whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm ${
                    sameAsMobile ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Current City <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Chennai, Delhi, Bangalore..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Runway Profile & Category */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              02
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Runway Profile & Category</h2>
              <p className="text-xs text-charcoal-muted">Classification for backstage fitting and sequence scheduling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Contestant Category <span className="text-lime-accent">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory focus:outline-none focus:border-lime-accent text-sm"
              >
                <option value="Runway Model">Runway Model (Adults / Open)</option>
                <option value="Teen / Fresher Runway">Teen / Fresher Runway</option>
                <option value="Kids Runway">Kids Runway Category</option>
                <option value="Designer Collection Showcase">Designer Collection Showcase</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Height (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 5ft 9in or 175 cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Instagram / Portfolio Handle
              </label>
              <input
                type="text"
                placeholder="@username or portfolio link"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Prior Runway Experience
              </label>
              <input
                type="text"
                placeholder="e.g. Fresher, college runway, shoot experience..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Manual UPI Payment & Proof Submission */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              03
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Manual UPI Payment & Proof</h2>
              <p className="text-xs text-charcoal-muted">Standard Total Event Fee: ₹5,000</p>
            </div>
          </div>

          {/* Payment Denomination Selector */}
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-3">
              Select Advance Payment Option <span className="text-lime-accent">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-card border cursor-pointer transition-all ${
                  paymentOption === 'advance_2000'
                    ? 'border-lime-accent bg-charcoal-surface text-ivory shadow-sm'
                    : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border/80'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'advance_2000'}
                  onChange={() => setPaymentOption('advance_2000')}
                  className="sr-only"
                />
                <div className="text-[10px] uppercase font-mono text-lime-accent mb-1">Standard Advance</div>
                <div className="text-lg font-bold text-ivory tabular-nums">₹2,000</div>
                <div className="text-xs text-charcoal-muted mt-1">Remaining ₹3,000 via Balance Portal</div>
              </label>

              <label
                className={`p-4 rounded-card border cursor-pointer transition-all ${
                  paymentOption === 'advance_1500'
                    ? 'border-lime-accent bg-charcoal-surface text-ivory shadow-sm'
                    : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border/80'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'advance_1500'}
                  onChange={() => setPaymentOption('advance_1500')}
                  className="sr-only"
                />
                <div className="text-[10px] uppercase font-mono text-charcoal-muted mb-1">Initial Advance</div>
                <div className="text-lg font-bold text-ivory tabular-nums">₹1,500</div>
                <div className="text-xs text-charcoal-muted mt-1">Remaining ₹3,500 via Balance Portal</div>
              </label>

              <label
                className={`p-4 rounded-card border cursor-pointer transition-all ${
                  paymentOption === 'full'
                    ? 'border-lime-accent bg-charcoal-surface text-ivory shadow-sm'
                    : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border/80'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'full'}
                  onChange={() => setPaymentOption('full')}
                  className="sr-only"
                />
                <div className="text-[10px] uppercase font-mono text-status-success mb-1">Full Clearance</div>
                <div className="text-lg font-bold text-ivory tabular-nums">₹5,000</div>
                <div className="text-xs text-charcoal-muted mt-1">Complete clearance upon verification</div>
              </label>
            </div>
          </div>

          {/* QR Code and Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#101213] border border-charcoal-border rounded-card p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-mono tracking-widest text-lime-accent mb-3">Scan & Pay</span>
              <div className="w-52 h-52 bg-white p-3 rounded-card shadow-lg flex items-center justify-center">
                <img
                  src={paymentInfo?.qr_code_url || "/qr_code.png"}
                  alt="Skyra Creations UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mt-3 text-[11px] font-mono text-charcoal-muted">
                Google Pay • PhonePe • Paytm • BHIM UPI
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-charcoal-card p-4 rounded-card border border-charcoal-border">
                <span className="text-[11px] font-mono uppercase text-charcoal-muted block mb-1">Verified Merchant UPI ID</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-lime-accent select-all">
                    {paymentInfo?.upi_id || "mr.death4646@oksbi"}
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="p-1.5 rounded-btn bg-charcoal-surface border border-charcoal-border hover:border-lime-accent text-charcoal-muted hover:text-lime-accent"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-lime-accent" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-xs text-charcoal-muted mt-1.5 block">
                  Payee: <strong className="text-ivory font-medium">{paymentInfo?.upi_name || "Sanjay Mass"}</strong>
                </span>
              </div>

              <div className="bg-charcoal-card p-4 rounded-card border border-charcoal-border flex justify-between items-center">
                <span className="text-xs text-charcoal-muted">Amount to Transfer:</span>
                <span className="text-xl font-bold text-lime-accent tabular-nums">
                  ₹{getEffectiveAmount().toLocaleString('en-IN')}
                </span>
              </div>

              <a
                href={`upi://pay?pa=${paymentInfo?.upi_id || 'mr.death4646@oksbi'}&pn=${encodeURIComponent(paymentInfo?.upi_name || 'Sanjay Mass')}&am=${getEffectiveAmount()}&cu=INR`}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-btn bg-charcoal-surface hover:bg-charcoal-card text-lime-accent text-xs uppercase font-mono tracking-wider border border-charcoal-border transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch UPI App (Mobile)</span>
              </a>
            </div>
          </div>

          {/* UTR and Screenshot Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Transaction ID / UTR Number <span className="text-lime-accent">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="12-digit UTR from your bank/UPI app"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent font-mono text-sm"
              />
              <p className="text-[11px] text-charcoal-muted mt-1.5 font-light">Found on your UPI success screen.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Payment Screenshot <span className="text-lime-accent">*</span>
              </label>
              
              <div className="relative border-2 border-dashed border-charcoal-border hover:border-lime-accent/50 rounded-card p-4 text-center cursor-pointer bg-[#101213] transition-colors">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {screenshotPreview ? (
                  <div className="flex items-center space-x-3">
                    <img src={screenshotPreview} alt="Screenshot preview" className="w-12 h-12 object-cover rounded-btn border border-charcoal-border" />
                    <div className="text-left text-xs truncate">
                      <p className="font-semibold text-lime-accent">{screenshotFile?.name}</p>
                      <p className="text-charcoal-muted">{((screenshotFile?.size || 0) / 1024).toFixed(0)} KB • Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Upload className="w-5 h-5 text-charcoal-muted mb-1" />
                    <span className="text-xs font-medium text-ivory">Click to upload screenshot</span>
                    <span className="text-[11px] text-charcoal-muted font-mono mt-0.5">JPG, PNG, WebP up to 10 MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Terms and Declaration */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <h2 className="font-editorial text-2xl text-ivory mb-3">Terms & Conditions Declaration</h2>
          <ul className="text-xs text-charcoal-muted space-y-1.5 mb-6 list-disc list-inside bg-[#101213] p-4 rounded-card border border-charcoal-border">
            <li>Registration will be confirmed only after manual payment verification against bank statement credit.</li>
            <li>Registration fee is non-refundable under any circumstances.</li>
            <li>Fabricated screenshots or duplicate UTR submissions lead to immediate blacklisting.</li>
            <li>Participants must adhere to the runway sequence and rehearsal guidelines.</li>
            <li>SKYRA CREATIONS reserves the right of admission and scheduling.</li>
          </ul>

          <label className="flex items-start space-x-3 p-4 rounded-card bg-charcoal-surface border border-charcoal-border cursor-pointer hover:border-lime-accent/40 transition-colors">
            <input
              type="checkbox"
              required
              checked={termsConfirmed}
              onChange={(e) => setTermsConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-charcoal-border bg-[#101213] text-lime-accent focus:ring-0 w-4 h-4"
            />
            <span className="text-xs sm:text-sm text-ivory font-medium">
              I confirm that the above details are authentic and I accept all event terms. <span className="text-lime-accent">*</span>
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-btn font-semibold text-xs uppercase tracking-wider shadow-lime-glow flex items-center justify-center space-x-3 transition-all ${
              loading
                ? 'bg-charcoal-surface text-charcoal-muted cursor-not-allowed border border-charcoal-border'
                : 'bg-lime-accent text-charcoal hover:bg-[#c9f556] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span>{uploadStatusText} ({uploadPercent}%)</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Registration & Authorize ₹{getEffectiveAmount().toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-charcoal-muted mt-3 font-light">
            Already registered and paying remaining balance?{' '}
            <button 
              type="button" 
              onClick={() => setActiveTab('balance')} 
              className="text-lime-accent hover:underline font-medium"
            >
              Open Balance Portal
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
