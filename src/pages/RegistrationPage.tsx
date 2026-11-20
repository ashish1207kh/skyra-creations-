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
  Copy, 
  Check,
  QrCode
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

  // 3.1 Personal Information
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  // 3.2 Modelling Profile
  const [category, setCategory] = useState('Runway Model');
  const [height, setHeight] = useState('');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('');

  // 3.3 Registration Payment
  const [paymentOption, setPaymentOption] = useState<'advance_1500' | 'half_2500' | 'full_5000'>('advance_1500');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // 3.4 Declaration & Agreement
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

  const getEffectiveAmount = () => {
    if (paymentOption === 'full_5000') return 5000;
    if (paymentOption === 'half_2500') return 2500;
    return 1500;
  };

  const handleCopyUpi = () => {
    const upi = paymentInfo?.upi_id || 'mr.death4646@oksbi';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validations
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name as mentioned on your official identification.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid active email address.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your date of birth.');
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      setErrorMsg('Please enter a valid calling mobile number (10 to 15 digits).');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 10) {
      setErrorMsg('Please enter a valid WhatsApp number for official event communication.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your current city and state.');
      return;
    }

    // Payment Validations
    const cleanTx = transactionId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setErrorMsg('Please enter the 12-digit UPI transaction reference / UTR number.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload a clear screenshot of your completed UPI payment.');
      return;
    }
    if (!termsConfirmed) {
      setErrorMsg('You must review and accept the declaration and terms to register.');
      return;
    }

    setLoading(true);
    setUploadPercent(10);
    setUploadStatusText('Preparing secure payment proof upload...');

    try {
      // 1. Upload screenshot directly to Cloudflare R2 via presigned PUT
      setUploadStatusText('Uploading transaction screenshot to secure storage...');
      const r2ObjectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(percent);
      });

      setUploadStatusText('Registering participant record with SKYRA CREATIONS...');
      const regResponse = await registerContestant({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        dob,
        gender,
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        category,
        height: height.trim() || null,
        instagram: instagram.trim() || null,
        experience: experience.trim() || null,
        amount: getEffectiveAmount(),
        transaction_id: cleanTx,
        r2_object_key: r2ObjectKey,
        terms_confirmed: true,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessResult({
        reg_id: regResponse.reg_id,
        message: regResponse.message,
      });

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setLoading(false);
      setUploadPercent(0);
      setUploadStatusText('');
    }
  };

  // Success Screen
  if (successResult) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-[#12151e] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Submission Acknowledged
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Your Registration Has Been Received
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Thank you for registering with SKYRA CREATIONS. Your registration details and payment submission have been recorded successfully and are awaiting review.
          </p>

          <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-6 max-w-md mx-auto mb-8 shadow-inner">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-1">Your Official Registration ID</p>
            <p className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider">
              {successResult.reg_id}
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">
              Please save or screenshot this Registration ID for all future event communication.
            </p>
          </div>

          {/* Next Steps Guidance */}
          <div className="text-left bg-[#171a24] border border-zinc-800 rounded-2xl p-6 mb-8 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Next Steps in Your Journey</span>
            </h4>
            <ul className="text-xs sm:text-sm text-zinc-300 space-y-2.5 list-disc list-inside">
              <li>
                <strong className="text-white">Save your Registration ID</strong> ({successResult.reg_id}) for reference.
              </li>
              <li>
                <strong className="text-white">Verification Process:</strong> Our team will review your submitted details and verify the payment proof against official records. Verification is generally completed within 24–48 hours.
              </li>
              <li>
                <strong className="text-white">WhatsApp Outreach:</strong> You will receive an official update on your registered WhatsApp number ({whatsapp}) once verification is complete.
              </li>
              <li>
                <strong className="text-white">Balance Payment:</strong> If you made an initial token or half payment, you can use the Balance Payment portal at any time to clear your outstanding balance.
              </li>
              <li>
                <strong className="text-white">Digital Entry Pass:</strong> Once your registration is confirmed, your official entry pass will unlock in the Check Status &amp; Pass portal.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Track Registration Status
            </button>
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('balance');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-all border border-zinc-700"
            >
              Go to Balance Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Official Master Spec Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171a24] via-[#1b1f2c] to-[#171a24] border border-amber-500/30 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>SKYRA CREATIONS — RUNWAY SHOW 2026</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Begin Your Runway Journey
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 font-medium">
              Register for the SKYRA CREATIONS Runway Show 2026 and take the next step in your modelling journey.
            </p>
          </div>

          <div className="shrink-0 bg-black/80 rounded-2xl p-2.5 border border-amber-500/30 shadow-xl self-start sm:self-center">
            <img 
              src="/logo.png" 
              alt="Skyra Creations Logo" 
              className="w-24 sm:w-28 h-auto object-contain"
            />
          </div>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300 border-l-2 border-amber-500/60 pl-4 py-1 leading-relaxed">
          <p className="font-medium text-amber-200">
            Welcome to SKYRA CREATIONS. We are pleased to invite you to register for our Runway Show 2026.
          </p>
          <p>
            Please complete the registration form carefully and provide accurate information. Your submitted details will be used for participant communication, registration verification and event coordination.
          </p>
          <p className="text-amber-400/95 font-medium">
            Our team will contact you through your registered WhatsApp number after reviewing your registration and payment details.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] sm:text-xs text-zinc-400 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-zinc-200">Important Notice:</strong> Registration is subject to verification and approval by SKYRA CREATIONS. Please complete the applicable payment and upload the transaction proof during registration. All registration fees are non-refundable, subject to the terms and conditions accepted during registration.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Please check your details</p>
            <p className="text-xs sm:text-sm mt-0.5 text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 3.1 PERSONAL INFORMATION */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <User className="w-5 h-5 text-amber-400" />
              <span>Personal Information</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Please provide your details accurately. Ensure that your name matches the official identification you intend to use for verification and event documentation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name as mentioned on your official identification"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Enter your full name as mentioned on your official identification. Minimum 2 characters.
              </p>
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Enter an active email address for registration records and important updates.
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Date of Birth <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors [color-scheme:dark]"
                />
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Select your date of birth.</p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Gender <span className="text-amber-400">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">Select your gender.</p>
            </div>

            {/* Calling Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Calling Mobile Number <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="+91 9876543210"
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Enter your mobile number, including country code where applicable (10–15 digits).
              </p>
            </div>

            {/* WhatsApp Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">
                  WhatsApp Number <span className="text-amber-400">*</span>
                </label>
                <label className="flex items-center space-x-1.5 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={handleSameAsMobileToggle}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Same as Calling Number</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  disabled={sameAsMobile}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 9876543210"
                  className={`w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors ${
                    sameAsMobile ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                />
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Enter the number on which you can receive official event updates.
              </p>
            </div>

            {/* Current City & State */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Current City &amp; State <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai, Maharashtra"
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">Enter your current city and state.</p>
            </div>
          </div>
        </div>

        {/* 3.2 MODELLING PROFILE */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Your Modelling Profile</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Tell us a little about your modelling interests and experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Participation Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Participation Category <span className="text-amber-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              >
                <option value="Runway Model">Runway Model</option>
                <option value="Kids Model">Kids Model</option>
                <option value="Plus Size Model">Plus Size Model</option>
                <option value="Fitness Model">Fitness Model</option>
                <option value="Designer Showcase">Designer Showcase</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Choose the runway category you wish to participate in.
              </p>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Height <span className="text-zinc-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="5 ft 8 in / 173 cm"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Enter your height in your preferred format.</p>
            </div>

            {/* Instagram Profile */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Instagram Profile <span className="text-zinc-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">Share your Instagram username or profile link.</p>
            </div>

            {/* Prior Experience */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Prior Experience <span className="text-zinc-500">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Briefly describe your previous fashion shows, pageants or modelling experience. If you are new to modelling, you can mention that you are a fresher."
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Briefly describe your previous fashion shows, pageants or modelling experience. If you are new to modelling, you can mention that you are a fresher.
              </p>
            </div>
          </div>
        </div>

        {/* 3.3 REGISTRATION PAYMENT */}
        <div className="bg-[#12151e]/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Registration Payment</span>
              </h2>
              <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                Total Event Fee: ₹5,000
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Complete your initial payment using the official payment details below. Select the amount you intend to pay and submit the transaction reference along with your payment screenshot.
            </p>
          </div>

          {/* Amount Options */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-300 mb-3">
              Select Initial Payment Amount <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Token Advance ₹1,500 */}
              <button
                type="button"
                onClick={() => setPaymentOption('advance_1500')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentOption === 'advance_1500'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-[#0a0c12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Token Advance</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentOption === 'advance_1500' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                  }`}>
                    {paymentOption === 'advance_1500' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-white">₹1,500</div>
                <div className="text-[11px] text-zinc-400 mt-1">Remaining: ₹3,500 balance</div>
              </button>

              {/* Option 2: Half Payment ₹2,500 */}
              <button
                type="button"
                onClick={() => setPaymentOption('half_2500')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentOption === 'half_2500'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-[#0a0c12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Half Payment</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentOption === 'half_2500' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                  }`}>
                    {paymentOption === 'half_2500' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-white">₹2,500</div>
                <div className="text-[11px] text-zinc-400 mt-1">Remaining: ₹2,500 balance</div>
              </button>

              {/* Option 3: Full Payment ₹5,000 */}
              <button
                type="button"
                onClick={() => setPaymentOption('full_5000')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  paymentOption === 'full_5000'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-[#0a0c12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Full Payment</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentOption === 'full_5000' ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                  }`}>
                    {paymentOption === 'full_5000' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                  </div>
                </div>
                <div className="text-xl font-extrabold text-white">₹5,000</div>
                <div className="text-[11px] text-zinc-400 mt-1">Remaining: ₹0 balance</div>
              </button>
            </div>
          </div>

          {/* Official Payment Info & QR */}
          <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <QrCode className="w-4 h-4" />
                  <span>Official UPI Payment Details</span>
                </div>
                <div className="space-y-2 text-sm text-zinc-300">
                  <div>
                    <span className="text-xs text-zinc-500 block">Payee Name</span>
                    <strong className="text-white text-base">Sanjay Mass</strong>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Official UPI ID</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <code className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-amber-300 font-mono text-sm">
                        {paymentInfo?.upi_id || 'mr.death4646@oksbi'}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    {copiedUpi && (
                      <p className="text-[11px] text-emerald-400 mt-1">UPI ID copied to clipboard!</p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Amount to Pay</span>
                    <strong className="text-amber-400 text-lg">₹{getEffectiveAmount().toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="text-center p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 flex flex-col items-center justify-center">
                <img
                  src="/qr_code.png"
                  alt="Skyra Creations UPI QR Code"
                  className="w-40 h-40 object-contain rounded-xl bg-white p-2 shadow-lg mb-2"
                />
                <p className="text-xs text-zinc-400 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
              </div>
            </div>
          </div>

          {/* Payment Proof Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* UPI Transaction ID / UTR */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                UPI Transaction ID / UTR <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter the 12-digit transaction reference shown in your UPI details (e.g. 412345678901)"
                className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Enter the 12-digit transaction reference shown in your UPI payment details.
              </p>
            </div>

            {/* Payment Screenshot Upload */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Payment Screenshot <span className="text-amber-400">*</span>
              </label>
              <div className="border-2 border-dashed border-zinc-700 hover:border-amber-500/50 rounded-2xl p-6 text-center bg-[#0a0c12] transition-colors">
                {screenshotPreview ? (
                  <div className="space-y-3">
                    <img
                      src={screenshotPreview}
                      alt="Uploaded Payment Screenshot"
                      className="max-h-48 mx-auto rounded-lg border border-zinc-700 object-contain"
                    />
                    <div className="text-xs text-zinc-300">
                      <span>{screenshotFile?.name}</span> ({(screenshotFile?.size ? screenshotFile.size / 1024 : 0).toFixed(0)} KB)
                    </div>
                    <label className="inline-block px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs cursor-pointer">
                      <span>Change File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white mb-1">
                      Upload your payment screenshot
                    </p>
                    <p className="text-xs text-zinc-400 mb-3">
                      Ensure that the transaction reference and payment amount are clearly visible. Accepted formats: JPG, PNG, and WebP (up to 10 MB).
                    </p>
                    <label className="inline-block px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <span>Browse Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Your payment will remain pending until it has been reviewed and verified by the SKYRA CREATIONS team.
              </p>
            </div>
          </div>
        </div>

        {/* 3.4 DECLARATION AND TERMS */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="border-b border-zinc-800 pb-3 mb-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Declaration &amp; Agreement</span>
            </h3>
          </div>

          <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-xl p-4 mb-4 text-xs text-zinc-300 space-y-2">
            <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Official Event Policies:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>All registration fees are non-refundable.</li>
              <li>SKYRA CREATIONS reserves the right to accept or reject registrations.</li>
              <li>Rehearsal schedules and venue entry are subject to the applicable verification requirements and issuance of a valid digital entry pass.</li>
              <li>Official event communications will be sent to the WhatsApp number provided during registration.</li>
            </ul>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsConfirmed}
              onChange={(e) => setTermsConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400 shrink-0"
            />
            <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              I confirm that the information provided in this registration form is accurate and complete. I understand that registration fees are non-refundable under the stated policy. I agree to follow the code of conduct, rehearsal schedules, event instructions and guidelines issued by SKYRA CREATIONS.
            </span>
          </label>
        </div>

        {/* 3.5 SUBMISSION BUTTON */}
        <div>
          {uploadStatusText && (
            <div className="mb-4 text-center">
              <p className="text-xs text-amber-300 mb-1">{uploadStatusText}</p>
              {uploadPercent > 0 && (
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden max-w-md mx-auto">
                  <div
                    className="bg-amber-400 h-1.5 transition-all duration-300"
                    style={{ width: `${uploadPercent}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all shadow-xl ${
              loading
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-amber-500/20 hover:shadow-amber-500/30'
            }`}
          >
            {loading ? 'Submitting your registration...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
