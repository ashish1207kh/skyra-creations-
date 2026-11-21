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
  QrCode,
  MessageSquare,
  Camera,
  Award,
  Star,
  Gift,
  AlertTriangle,
  X,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';
import { getPaymentInfo, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo } from '../types/index';
import DynamicUpiPayment from '../components/DynamicUpiPayment';

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

  // Model Photograph
  const [modelPhotoFile, setModelPhotoFile] = useState<File | null>(null);
  const [modelPhotoPreview, setModelPhotoPreview] = useState<string | null>(null);

  // 3.2 Modelling Profile
  const [category] = useState('Runway Model');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('');

  // 3.3 Registration Payment — Allowed Token Advances: ₹500, ₹1,000, ₹1,500
  const [tokenAdvance, setTokenAdvance] = useState<number>(1000);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // 3.4 Declaration & Agreement
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  useEffect(() => {
    getPaymentInfo()
      .then(data => {
        setPaymentInfo(data);
        if (data.allowed_token_advances && data.allowed_token_advances.length > 0) {
          if (!data.allowed_token_advances.includes(tokenAdvance)) {
            setTokenAdvance(data.allowed_token_advances[1] || data.allowed_token_advances[0]);
          }
        }
      })
      .catch(err => console.error("Error loading payment info", err));
  }, []);

  const totalFee = paymentInfo?.default_total_fee ?? 3000;
  const remainingBalance = Math.max(0, totalFee - tokenAdvance);

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

  const handleModelPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('Invalid photo format. Please upload JPG, PNG, or WebP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Model photograph file size exceeds the 10 MB maximum limit.');
        return;
      }
      setModelPhotoFile(file);
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setModelPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveModelPhoto = () => {
    setModelPhotoFile(null);
    setModelPhotoPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('Invalid payment screenshot format. Please upload JPG, PNG, or WebP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Payment screenshot file size exceeds the 10 MB maximum limit.');
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

  const handleCopyUpi = () => {
    const upi = paymentInfo?.upi_id || 'sri.469512-1@oksbi';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Personal Details Validations
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

    // Model Photo Validation (Mandatory)
    if (!modelPhotoFile) {
      setErrorMsg('Please upload your recent model photograph with your face clearly visible.');
      return;
    }

    // Payment Validations
    const cleanTx = transactionId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setErrorMsg('Please enter the 12-digit UPI transaction reference / UTR number.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload a clear screenshot of your completed UPI token advance payment.');
      return;
    }
    if (!termsConfirmed) {
      setErrorMsg('You must review and accept the Official Terms & Event Policies and Participant Declaration to register.');
      return;
    }

    setLoading(true);
    setUploadPercent(10);
    setUploadStatusText('Uploading recent model photograph to secure storage...');

    try {
      // 1. Upload Model Photograph directly to Cloudflare R2 ('photos' folder)
      const modelPhotoKey = await uploadFileToR2(modelPhotoFile, 'photos', (percent) => {
        setUploadPercent(Math.round(percent * 0.45));
      });

      // 2. Upload Payment Screenshot to Cloudflare R2 ('proofs' folder)
      setUploadStatusText('Uploading payment screenshot to secure storage...');
      const r2ObjectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(45 + Math.round(percent * 0.45));
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
        height: null,
        instagram: instagram.trim() || null,
        experience: experience.trim() || null,
        model_photo_r2_key: modelPhotoKey,
        amount: tokenAdvance,
        transaction_id: cleanTx,
        r2_object_key: r2ObjectKey,
        terms_confirmed: true,
        terms_version: paymentInfo?.terms_version || '2026.2',
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
                <strong className="text-white">Venue &amp; Timing Announcement:</strong> The event location is in <strong className="text-amber-300">Chennai (City Center / Prime City, not outer areas)</strong>. The exact venue address and show schedule will be officially announced <strong className="text-amber-300">10 days before the show</strong> and sent to your registered WhatsApp.
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
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Founder & CEO Profile */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#12151e] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200"></div>

            <div className="relative mb-5 overflow-hidden rounded-2xl border border-amber-500/30 bg-black shadow-lg">
              <img
                src="/founder.jpg"
                alt="B. SRIRAM — Founder &amp; CEO, Skyra Creations Runway Show 2026"
                width={380}
                height={420}
                className="w-full h-auto max-h-[420px] object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider shadow">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Founder &amp; CEO</span>
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
                  Event Leadership
                </span>
                <h3 className="font-serif text-2xl font-extrabold text-white tracking-wide">
                  B. SRIRAM
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Founder &amp; CEO, Skyra Creations
                </p>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-amber-500/40 pl-3 py-0.5">
                "Welcome to Skyra Creations. We are committed to discovering, mentoring, and launching aspiring models on the premier runway."
              </p>

              {/* Direct Contact Info */}
              <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Direct Contact:</span>
                  <a
                    href="tel:9342049287"
                    className="font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>9342049287</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:9342049287"
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Call Now</span>
                  </a>

                  <a
                    href="https://wa.me/919342049287?text=Hello%20Sriram%20sir%2C%20I%20am%20inquiring%20about%20the%20Skyra%20Creations%20Runway%20Show%202026%20registration."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Official Instagram Profile */}
                  <a
                    href="https://www.instagram.com/skyra_creations_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-colors shadow-sm"
                    aria-label="Follow SKYRA CREATIONS on Instagram"
                  >
                    <svg className="w-3.5 h-3.5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Follow @skyra_creations_</span>
                  </a>
                </div>

                {/* Event Location & Schedule Notice in Founder Card */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-2">
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Location: Chennai (City Center)</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    Hosted exclusively in <strong>central Chennai</strong> (prime city, not outer areas).
                  </p>
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold pt-1.5 border-t border-amber-500/20">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Schedule &amp; Venue Details</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    Exact venue address and event timings will be <strong>officially announced 10 days before the show</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Registration Form & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Official Master Spec Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#171a24] via-[#1b1f2c] to-[#171a24] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
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

          <div className="shrink-0 relative group self-start sm:self-center select-none">
            <div 
              className="absolute -inset-2 rounded-full blur-xl opacity-50 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(220, 38, 38, 0.5) 0%, rgba(198, 255, 0, 0.35) 45%, transparent 75%)',
              }}
            />
            <div 
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2px] shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(198, 255, 0, 0.4) 40%, rgba(220, 38, 38, 0.6) 100%)',
              }}
            >
              <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center p-1">
                <img 
                  src="/logo.png" 
                  alt="SKYRA CREATIONS — Runway Show 2026 Model Registration Emblem" 
                  width={112}
                  height={112}
                  className="w-full h-full object-cover rounded-full scale-[1.08]"
                />
              </div>
            </div>
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

      {/* Prominent Venue & Schedule Announcement */}
      <div className="bg-gradient-to-r from-amber-950/50 via-[#1f1710] to-[#12151e] border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                Important Venue &amp; Schedule Announcement
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                Chennai (City Center — Not Outer)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              <strong className="text-white">Event Location:</strong> The runway show is hosted within <strong className="text-amber-300">Chennai city center (prime location, not outer areas)</strong>.
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <strong className="text-white">Venue Address &amp; Event Timings:</strong> The exact venue address and show schedule will be <strong className="text-amber-300">officially announced 10 days before the show</strong> and communicated directly to your registered WhatsApp number as well as published on this portal.
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ IMPORTANT SHOW INFORMATION & PARTICIPANT BENEFITS */}
      <section className="bg-gradient-to-b from-[#161a26] to-[#11131c] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-white tracking-wide">
              IMPORTANT SHOW INFORMATION &amp; PARTICIPANT BENEFITS
            </h2>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              Please review these official guidelines and provisions before completing your registration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Card 1 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">1</span>
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Open Participation</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              No age limit or restrictions on body type, skin tone, or modelling experience. Freshers are welcome.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">2</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Complete Runway Experience</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Participants will receive professional runway training, grooming guidance, choreography, and stage preparation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">3</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Professional Make-Up</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Professional make-up artists will be arranged for the participants.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">4</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Costume</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Rental costumes will be provided for the show as per the assigned theme and requirements.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">5</span>
              <Camera className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Photoshoot</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Participants will receive professional photoshoot opportunities as part of the event experience.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">6</span>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Certificates &amp; Trophies</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Participation certificates and trophies will be provided as applicable to the event.
            </p>
          </div>

          {/* Card 7 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">7</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Rewards &amp; Recognition</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Top performers may be eligible for special rewards, recognition, and exclusive opportunities.
            </p>
          </div>

          {/* Card 8 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">8</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Future Opportunities</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Participants may get opportunities to be considered for upcoming SKYRA CREATIONS shows and projects.
            </p>
          </div>

          {/* Card 9 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">9</span>
              <Gift className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Referral Benefits</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Referral offers and special benefits may be available for eligible participants.
            </p>
          </div>

          {/* Card 10 */}
          <div className="bg-[#0c0e15] border border-red-500/30 hover:border-red-500/60 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center justify-center">10</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-sm font-bold text-red-300 mb-1">Non-Refundable Policy</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              All registration payments are strictly non-refundable once paid.
            </p>
          </div>

          {/* Card 11 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">11</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Registration Approval</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Registrations are subject to payment verification, slot availability, and approval by SKYRA CREATIONS.
            </p>
          </div>

          {/* Card 12 */}
          <div className="bg-[#0c0e15] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center">12</span>
              <CheckCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Participant Commitment</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Participants are expected to attend rehearsals, follow instructions, and maintain professional conduct throughout the event.
            </p>
          </div>
        </div>
      </section>

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

            {/* Upload Your Recent Model Photograph (Mandatory) */}
            <div className="sm:col-span-2 pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="text-sm font-bold text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Upload Your Recent Model Photograph</span>
                  <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Mandatory Field
                </span>
              </div>

              <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                Please upload a clear, recent photograph in which your face is fully visible. Avoid photographs with sunglasses, masks, heavy filters, face coverings, or images that hide your facial features. Your face should be clearly recognizable.
              </p>

              {/* Visual Warning Box */}
              <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 flex items-start space-x-2.5 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 uppercase tracking-wide">IMPORTANT: </strong>
                  <span>Upload a clear photograph with your face fully visible. Please do not upload photos where your face is hidden, covered or unclear.</span>
                </div>
              </div>

              {/* Upload Dropzone / Preview */}
              <div className="border-2 border-dashed border-zinc-700 hover:border-amber-500/50 rounded-2xl p-6 text-center bg-[#0a0c12] transition-colors relative">
                {modelPhotoPreview ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <img
                        src={modelPhotoPreview}
                        alt="Selected Model Photograph"
                        className="max-h-60 max-w-xs mx-auto rounded-xl border border-amber-500/40 object-cover shadow-2xl"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveModelPhoto}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-colors"
                        title="Remove photograph"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-zinc-300 flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-white">{modelPhotoFile?.name}</span>
                      <span className="text-zinc-500">({(modelPhotoFile?.size ? modelPhotoFile.size / 1024 : 0).toFixed(0)} KB)</span>
                    </div>
                    <div>
                      <label className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors border border-zinc-700 shadow-sm">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Replace Photograph</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleModelPhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <Camera className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      Choose Your Recent Model Photograph
                    </p>
                    <p className="text-xs text-zinc-400 mb-3 max-w-md mx-auto leading-relaxed">
                      Click browse to select your photograph from your device or gallery. Accepted formats: JPG, JPEG, PNG, and WebP (up to 10 MB).
                    </p>
                    <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-amber-500/20">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Photograph</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleModelPhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3.2 MODELLING & SOCIAL PROFILE (OPTIONAL) */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Modelling &amp; Social Profile <span className="text-xs text-zinc-500 font-sans font-normal">(Optional)</span></span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Share your social handle and any prior fashion experience (if any).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                Total Event Fee: ₹{totalFee.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              Select your token advance amount, complete your UPI payment using the official details below, and enter your 12-digit transaction UTR number along with the payment screenshot.
            </p>
          </div>

          {/* Token Advance Amount Selection */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Select Your Token Advance <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[500, 1000, 1500].map((amt) => {
                const isSelected = tokenAdvance === amt;
                const bal = totalFee - amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTokenAdvance(amt)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-[#0a0c12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Token Advance</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400' : 'border-zinc-700'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-white">₹{amt.toLocaleString('en-IN')}</div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Remaining: <strong className="text-zinc-200">₹{bal.toLocaleString('en-IN')}</strong> balance
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Payment Summary Card */}
            <div className="mt-4 p-4 rounded-2xl bg-[#0a0c12] border border-amber-500/30">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-2">Payment Summary</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="flex justify-between sm:block">
                  <span className="text-zinc-400">Total Event Fee:</span>
                  <div className="font-bold text-white text-base">₹{totalFee.toLocaleString('en-IN')}</div>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-zinc-400">Token Advance Selected:</span>
                  <div className="font-bold text-amber-400 text-base">₹{tokenAdvance.toLocaleString('en-IN')}</div>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-zinc-400">Remaining Balance:</span>
                  <div className="font-bold text-emerald-400 text-base">₹{remainingBalance.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Server-Controlled UPI Payment Component with 5 UPI App Buttons & Dynamic QR */}
          <div className="mb-6">
            <DynamicUpiPayment
              amount={tokenAdvance}
              paymentInfo={paymentInfo}
              paymentType="INITIAL_REGISTRATION"
            />
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

        {/* 3.4 OFFICIAL TERMS & EVENT POLICIES AND PARTICIPANT DECLARATION */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          {/* Section 1: Official Terms & Event Policies */}
          <div>
            <div className="border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>OFFICIAL TERMS &amp; EVENT POLICIES</span>
              </h3>
            </div>

            <div className="bg-[#0a0c12] border border-zinc-800/80 rounded-2xl p-5 text-xs sm:text-sm text-zinc-300 space-y-3.5">
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Non-Refundable &amp; Non-Transferable:</strong> All registration fees are strictly non-refundable and non-transferable.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Organizer Authority:</strong> SKYRA CREATIONS reserves the right to approve, decline, or cancel any registration based on event requirements and eligibility.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Event Venue &amp; Schedule:</strong> The event will be conducted in Chennai City Centre and selected nearby locations. The exact venue address and official event schedule will be announced 10 days prior to the event.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Attendance &amp; Verification:</strong> Rehearsal schedules, reporting times, and venue access are mandatory for all registered participants. Entry may be subject to identity verification and a valid digital entry pass.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
                <p className="leading-relaxed">
                  <strong className="text-white">Official Communication:</strong> All official updates, event instructions, and important announcements will be communicated through the WhatsApp number provided during registration. Participants are responsible for staying updated.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Participant Declaration */}
          <div className="pt-4 border-t border-zinc-800">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-2">
              PARTICIPANT DECLARATION
            </h4>
            
            <p className="text-xs sm:text-sm text-zinc-300 bg-[#0a0c12] border border-zinc-800 rounded-xl p-4 leading-relaxed mb-4 italic">
              "I hereby confirm that all information provided during registration is accurate and complete. I have read, understood, and agreed to the event policies, including the non-refundable registration fee policy. I agree to comply with all rehearsal schedules, reporting times, dress codes, event instructions, and guidelines issued by SKYRA CREATIONS. I understand that failure to comply with the event rules or instructions may affect my participation."
            </p>

            <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/30 transition-colors">
              <input
                type="checkbox"
                required
                checked={termsConfirmed}
                onChange={(e) => setTermsConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400 shrink-0"
              />
              <span className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                I have read, understood and agree to the Official Terms &amp; Event Policies and Participant Declaration.
              </span>
            </label>
          </div>
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
      </div>
    </div>
  );
}
