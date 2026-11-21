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
  CheckCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { getPaymentInfo, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo } from '../types/index';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import MagneticButton from '../components/MagneticButton';
import InstagramIcon from '../components/InstagramIcon';

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
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#12141a] border border-[#C6FF00]/40 rounded-sm p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Top subtle neon line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

          <div className="w-16 h-16 bg-[#C6FF00]/10 border border-[#C6FF00]/30 rounded-sm flex items-center justify-center mx-auto mb-6 text-[#C6FF00]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-block px-3.5 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] font-mono-editorial text-[10px] font-bold uppercase tracking-widest mb-4">
            SUBMISSION ACKNOWLEDGED // PENDING VERIFICATION
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            REGISTRATION RECEIVED.
          </h2>

          <p className="text-[#BFC3C7] text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
            Thank you for registering with SKYRA CREATIONS. Your participant credentials and token advance payment have been securely logged and transferred to our verification queue.
          </p>

          <div className="bg-[#080808] border border-white/15 rounded-sm p-6 max-w-md mx-auto mb-8 shadow-inner">
            <p className="font-mono-editorial text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
              OFFICIAL REGISTRATION IDENTIFIER
            </p>
            <p className="font-mono text-3xl font-extrabold text-[#C6FF00] tracking-wider">
              {successResult.reg_id}
            </p>
            <p className="font-mono-editorial text-[10px] text-zinc-400 mt-2">
              Please save or screenshot this ID for all official backstage and audition correspondence.
            </p>
          </div>

          {/* Next Steps Guidance */}
          <div className="text-left bg-[#0d0f14] border border-white/10 rounded-sm p-6 mb-8 space-y-3.5">
            <h4 className="font-mono-editorial text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
              <span>Next Steps in Your Journey</span>
            </h4>
            <ul className="text-xs sm:text-sm text-[#BFC3C7] space-y-2.5 list-disc list-inside font-light">
              <li>
                <strong className="text-white">Save your Registration ID:</strong> ({successResult.reg_id}) for reference.
              </li>
              <li>
                <strong className="text-white">Verification Process:</strong> Our operations desk reviews your submitted details and bank UTR statement within 24–48 hours.
              </li>
              <li>
                <strong className="text-white">Venue &amp; Timing Release:</strong> The event is hosted in <strong className="text-[#C6FF00]">Chennai City Center (Prime urban auditorium, not remote outskirts)</strong>. Exact venue address and runway call sheets are released <strong className="text-[#C6FF00]">10 days before the show</strong>.
              </li>
              <li>
                <strong className="text-white">WhatsApp Outreach:</strong> Official call sheets and rehearsal schedules will be sent to your WhatsApp ({whatsapp}).
              </li>
              <li>
                <strong className="text-white">Balance Settlement:</strong> You can clear your remaining balance of ₹{remainingBalance.toLocaleString('en-IN')} through the Balance Payment portal prior to final stage rehearsals.
              </li>
              <li>
                <strong className="text-white">Digital Entry Pass:</strong> Once verified, your official entry pass unlocks in the Check Status &amp; Pass portal.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF00]/15"
            >
              TRACK REGISTRATION STATUS
            </MagneticButton>
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('balance');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider transition-all border border-white/15"
            >
              GO TO BALANCE PORTAL
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Founder & CEO Profile */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden group">
            {/* Top architectural neon accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

            <div className="relative mb-5 overflow-hidden rounded-sm border border-white/10 bg-black shadow-lg">
              <img
                src="/founder.jpg"
                alt="B. SRIRAM — Founder & CEO, SKYRA CREATIONS"
                width={380}
                height={420}
                className="w-full h-auto max-h-[420px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-sm bg-black/85 backdrop-blur-md text-[#C6FF00] border border-white/15 font-mono-editorial text-[10px] font-bold uppercase tracking-wider shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-pulse" />
                  <span>FOUNDER &amp; CEO</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] font-semibold block">
                  EVENT LEADERSHIP
                </span>
                <h3 className="font-editorial text-2xl font-bold text-white tracking-wide mt-0.5">
                  B. SRIRAM
                </h3>
                <p className="font-mono-editorial text-[11px] text-[#C6FF00]">
                  Founder &amp; Creative Producer, SKYRA CREATIONS
                </p>
              </div>

              <p className="text-xs text-[#BFC3C7] leading-relaxed border-l-2 border-[#C6FF00] pl-3 py-0.5 font-light">
                "Welcome to SKYRA CREATIONS. We are committed to discovering, mentoring, and launching aspiring models on the premier runway."
              </p>

              {/* Direct Contact Info */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#BFC3C7]">Direct Helpline:</span>
                  <a
                    href="tel:9342049287"
                    className="font-bold text-[#C6FF00] hover:underline flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 93420 49287</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono-editorial">
                  <a
                    href="tel:9342049287"
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold border border-white/10 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C6FF00]" />
                    <span>CALL DESK</span>
                  </a>

                  <a
                    href="https://wa.me/919342049287?text=Hello%20Sriram%20sir%2C%20I%20am%20inquiring%20about%20the%20Skyra%20Creations%20Runway%20Show%202026%20registration."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WHATSAPP</span>
                  </a>

                  {/* Official Instagram Profile */}
                  <a
                    href="https://www.instagram.com/skyra_creations_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[11px] font-semibold transition-colors group"
                    aria-label="Follow SKYRA CREATIONS on Instagram"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                    <span>FOLLOW @SKYRA_CREATIONS_</span>
                  </a>
                </div>

                {/* Event Location & Schedule Notice in Founder Card */}
                <div className="p-3.5 rounded-sm bg-[#080808] border border-white/10 space-y-2 mt-2">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[11px] font-bold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>LOCATION: CHENNAI CITY CENTER</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-light leading-normal">
                    Hosted exclusively in <strong className="text-white">prime central Chennai</strong> (auditorium venue, not remote outskirts).
                  </p>
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[11px] font-bold pt-2 border-t border-white/10">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>SCHEDULE RELEASE</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-light leading-normal">
                    Exact venue address &amp; timings will be <strong className="text-white">officially announced 10 days before the show</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Registration Form & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Master Spec Banner */}
          <div className="relative overflow-hidden bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] font-semibold tracking-widest uppercase mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SKYRA CREATIONS — RUNWAY SHOW 2026</span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.08]">
                  BEGIN YOUR RUNWAY JOURNEY.
                </h1>
                <p className="text-sm sm:text-base text-[#BFC3C7] mt-2 font-light">
                  Register for the SKYRA CREATIONS Runway Show 2026 and take the next step in your high-fashion career.
                </p>
              </div>

              <div className="shrink-0 relative group self-start sm:self-center select-none">
                <div 
                  className="absolute -inset-2 rounded-sm blur-xl opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(198, 255, 0, 0.35) 0%, rgba(220, 38, 38, 0.2) 50%, transparent 70%)',
                  }}
                />
                <div className="relative px-5 py-3 rounded-sm bg-black/80 border border-white/15 shadow-2xl">
                  <img 
                    src="/logo-clean.png" 
                    alt="SKYRA CREATIONS — Emblem" 
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-[#BFC3C7] border-l-2 border-[#C6FF00] pl-4 py-1 leading-relaxed font-light">
              <p className="font-medium text-white">
                Welcome to SKYRA CREATIONS. We invite aspiring and experienced talents to register for our 2026 Runway Show.
              </p>
              <p>
                Please complete the registration form with accurate details matching your legal ID. Your credentials will be used for verification, official backstage passes, and media lookbooks.
              </p>
              <p className="text-[#C6FF00] font-mono-editorial text-xs">
                Our operations team will contact you via WhatsApp upon review of your submission.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 text-[11px] sm:text-xs text-zinc-400 flex items-start space-x-2.5 font-light">
              <AlertCircle className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
              <p>
                <strong className="text-white font-medium">Important Notice:</strong> Registration is subject to verification and approval. Please complete the token advance payment and attach the transaction reference screenshot. All registration fees are strictly non-refundable once committed.
              </p>
            </div>
          </div>

          {/* Prominent Venue & Schedule Announcement */}
          <div className="bg-[#0b0c10] border border-[#C6FF00]/40 rounded-sm p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center shrink-0 text-[#C6FF00] mt-0.5 shadow">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-editorial text-[11px] font-bold uppercase tracking-widest text-[#C6FF00]">
                    VENUE &amp; SCHEDULE POLICY
                  </span>
                  <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white font-mono-editorial text-[10px] uppercase tracking-wider">
                    Chennai (City Center)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white leading-relaxed font-light">
                  <strong className="font-medium">Event Location:</strong> Hosted within central Chennai (prime city center auditorium, never remote outskirts).
                </p>
                <p className="text-xs sm:text-sm text-[#BFC3C7] leading-relaxed font-light">
                  <strong className="font-medium text-white">Venue Address &amp; Show Timings:</strong> The exact venue address and show schedule will be <strong className="text-[#C6FF00]">officially announced 10 days before the show</strong> and communicated directly to your registered WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* 12 PARTICIPANT BENEFITS & GUIDELINES */}
          <section className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                <span>01 // PROVISIONS &amp; PARTICIPATION SPECIFICATION</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                PARTICIPANT BENEFITS &amp; GUIDELINES
              </h2>
              <p className="text-xs text-[#BFC3C7] font-light mt-1">
                Please review these verified provisions included with your Runway Show 2026 showcase entry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[
                { num: '01', title: 'Open Participation', desc: 'No height or skin tone barriers. Freshers and experienced walkers are equally welcome.', icon: User },
                { num: '02', title: 'Runway Experience', desc: 'Professional ramp choreography, posture grooming, pacing, and stage preparation.', icon: Sparkles },
                { num: '03', title: 'Professional Make-Up', desc: 'Curated hair and makeup styling arranged by certified industry HMUA teams.', icon: Sparkles },
                { num: '04', title: 'Show Wardrobe', desc: 'Rental show garments provided matching your assigned collection theme.', icon: Sparkles },
                { num: '05', title: 'Photoshoot & Media', desc: 'High-resolution stage action captures for your professional portfolio.', icon: Camera },
                { num: '06', title: 'Certificates & Trophies', desc: 'Official Certificate of Participation and category trophies awarded.', icon: Award },
                { num: '07', title: 'Rewards & Recognition', desc: 'Top stage performers are eligible for special citations and media highlights.', icon: Star },
                { num: '08', title: 'Future Agency Castings', desc: 'Direct consideration for subsequent SKYRA productions, shoots, and campaigns.', icon: Sparkles },
                { num: '09', title: 'Referral Privileges', desc: 'Referral credits and special partner privileges for eligible participants.', icon: Gift },
                { num: '10', title: 'Strict Non-Refundable', desc: 'All registration advance tokens are strictly non-refundable once committed.', icon: AlertTriangle, highlight: true },
                { num: '11', title: 'Registration Approval', desc: 'Submissions are subject to payment verification, slot capacity, and desk approval.', icon: ShieldCheck },
                { num: '12', title: 'Participant Conduct', desc: 'Contestants are expected to attend mandatory rehearsals with professional discipline.', icon: CheckCheck },
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className={`bg-[#080808] border rounded-sm p-4 transition-all hover:border-[#C6FF00]/40 group ${
                    item.highlight ? 'border-red-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-editorial text-[10px] font-bold text-[#C6FF00]">
                      {item.num}
                    </span>
                    <item.icon className={`w-4 h-4 ${item.highlight ? 'text-red-400' : 'text-zinc-400 group-hover:text-[#C6FF00]'}`} />
                  </div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 font-mono-editorial ${item.highlight ? 'text-red-300' : 'text-white'}`}>
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#BFC3C7] leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-sm bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold font-mono-editorial uppercase text-xs">Validation Required</p>
                <p className="text-xs mt-0.5 text-red-300 font-light">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Main Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 3.1 PERSONAL INFORMATION */}
            <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
              <div className="border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                  <span>SECTION 02 // CANDIDATE CREDENTIALS</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#C6FF00]" />
                  <span>PERSONAL INFORMATION</span>
                </h2>
                <p className="text-xs text-[#BFC3C7] font-light mt-1">
                  Ensure your name matches your official identification card for accreditation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    FULL LEGAL NAME <span className="text-[#C6FF00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name as shown on your official ID"
                    className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                  />
                  <p className="font-mono-editorial text-[10px] text-zinc-500 mt-1">
                    Minimum 2 characters.
                  </p>
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    EMAIL ADDRESS <span className="text-[#C6FF00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className="w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    DATE OF BIRTH <span className="text-[#C6FF00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors [color-scheme:dark]"
                    />
                    <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    GENDER CATEGORY <span className="text-[#C6FF00]">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Calling Mobile Number */}
                <div>
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    CALLING MOBILE NUMBER <span className="text-[#C6FF00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                    />
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7]">
                      WHATSAPP NUMBER <span className="text-[#C6FF00]">*</span>
                    </label>
                    <label className="flex items-center space-x-1.5 font-mono-editorial text-[10px] text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsMobile}
                        onChange={handleSameAsMobileToggle}
                        className="rounded-sm border-zinc-700 bg-zinc-900 text-[#C6FF00] focus:ring-[#C6FF00]"
                      />
                      <span>SAME AS CALLING</span>
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
                      className={`w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors ${
                        sameAsMobile ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                    <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Current City & State */}
                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    CURRENT CITY &amp; STATE <span className="text-[#C6FF00]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className="w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                    />
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Upload Recent Model Photograph */}
                <div className="sm:col-span-2 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <label className="font-mono-editorial text-xs font-bold text-white flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-[#C6FF00]" />
                      <span>UPLOAD RECENT MODEL PHOTOGRAPH</span>
                      <span className="text-[#C6FF00]">*</span>
                    </label>
                    <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-wider bg-[#C6FF00]/10 border border-[#C6FF00]/30 px-2.5 py-0.5 rounded-sm">
                      MANDATORY VERIFICATION ASSET
                    </span>
                  </div>

                  <p className="text-xs text-[#BFC3C7] mb-3 leading-relaxed font-light">
                    Upload a clear recent portrait or full-length photo with face clearly visible. Avoid sunglasses, heavy filters, or face coverings.
                  </p>

                  {/* Upload Dropzone / Preview */}
                  <div className="border-2 border-dashed border-white/15 hover:border-[#C6FF00]/50 rounded-sm p-6 text-center bg-[#080808] transition-colors relative">
                    {modelPhotoPreview ? (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img
                            src={modelPhotoPreview}
                            alt="Selected Model Photograph"
                            className="max-h-60 max-w-xs mx-auto rounded-sm border border-white/20 object-cover shadow-2xl"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveModelPhoto}
                            className="absolute -top-2 -right-2 w-7 h-7 rounded-sm bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-colors"
                            title="Remove photograph"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-[#BFC3C7] flex items-center justify-center space-x-2 font-mono">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white">{modelPhotoFile?.name}</span>
                          <span className="text-zinc-500">({(modelPhotoFile?.size ? modelPhotoFile.size / 1024 : 0).toFixed(0)} KB)</span>
                        </div>
                        <div>
                          <label className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-mono-editorial font-semibold cursor-pointer transition-colors border border-white/15">
                            <Camera className="w-3.5 h-3.5 text-[#C6FF00]" />
                            <span>REPLACE PHOTOGRAPH</span>
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
                      <div className="py-4">
                        <div className="w-14 h-14 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 text-[#C6FF00] flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-7 h-7" />
                        </div>
                        <p className="font-editorial text-lg font-bold text-white mb-1">
                          Select Your Portrait or Portfolio Photo
                        </p>
                        <p className="font-mono-editorial text-[10px] text-zinc-400 mb-4 max-w-md mx-auto">
                          JPG, JPEG, PNG, or WebP up to 10 MB.
                        </p>
                        <label className="inline-flex items-center space-x-2 px-6 py-3 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer transition-all shadow-lg active:scale-98">
                          <Upload className="w-3.5 h-3.5" />
                          <span>BROWSE DEVICE STORAGE</span>
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
            <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
              <div className="border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                  <span>SECTION 03 // PORTFOLIO LINKS</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#C6FF00]" />
                  <span>MODELLING &amp; SOCIAL PROFILE</span>
                  <span className="font-mono-editorial text-xs text-zinc-500 font-normal">(OPTIONAL)</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    INSTAGRAM PROFILE HANDLE
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@yourusername"
                    className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    PRIOR CATWALK / MODELLING EXPERIENCE
                  </label>
                  <textarea
                    rows={3}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Briefly state any past runway walks, photo shoots, or pageants. If none, write 'Fresher'."
                    className="w-full bg-[#080808] border border-white/15 rounded-sm p-4 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3.3 REGISTRATION PAYMENT */}
            <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl">
              <div className="border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                      <span>SECTION 04 // TOKEN COMMITMENT</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-[#C6FF00]" />
                      <span>REGISTRATION PAYMENT</span>
                    </h2>
                  </div>
                  <span className="font-mono text-sm uppercase px-3 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-bold">
                    TOTAL FEE: ₹{totalFee.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-[#BFC3C7] font-light mt-1">
                  Select your token advance amount, make payment using the official UPI details, and enter your 12-digit transaction UTR reference with screenshot proof.
                </p>
              </div>

              {/* Token Advance Amount Selection */}
              <div className="mb-6">
                <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-2.5">
                  SELECT YOUR TOKEN ADVANCE <span className="text-[#C6FF00]">*</span>
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
                        className={`p-4 rounded-sm border text-left transition-all ${
                          isSelected
                            ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-white shadow-lg shadow-[#C6FF00]/10'
                            : 'bg-[#080808] border-white/15 text-zinc-400 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-wider text-[#C6FF00]">
                            TOKEN ADVANCE
                          </span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#C6FF00] bg-[#C6FF00]' : 'border-zinc-700'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                          ₹{amt.toLocaleString('en-IN')}
                        </div>
                        <div className="font-mono-editorial text-[10px] text-zinc-400 mt-1">
                          Remaining: <strong className="text-zinc-200">₹{bal.toLocaleString('en-IN')}</strong> balance
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Payment Summary Card */}
                <div className="mt-4 p-4 rounded-sm bg-[#080808] border border-white/10">
                  <div className="font-mono-editorial text-[10px] uppercase tracking-wider font-bold text-[#C6FF00] mb-2">
                    FINANCIAL SUMMARY
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-mono">
                    <div className="flex justify-between sm:block">
                      <span className="text-zinc-400 font-mono-editorial text-[10px] uppercase block">Total Showcase Fee:</span>
                      <div className="font-bold text-white text-base">₹{totalFee.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-zinc-400 font-mono-editorial text-[10px] uppercase block">Advance Committed:</span>
                      <div className="font-bold text-[#C6FF00] text-base">₹{tokenAdvance.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-zinc-400 font-mono-editorial text-[10px] uppercase block">Outstanding Balance:</span>
                      <div className="font-bold text-emerald-400 text-base">₹{remainingBalance.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Server-Controlled UPI Payment Component */}
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
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    12-DIGIT UPI TRANSACTION REFERENCE / UTR <span className="text-[#C6FF00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter the 12-digit UTR reference (e.g. 412345678901)"
                    className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] focus:ring-1 focus:ring-[#C6FF00] transition-colors font-mono tracking-wider"
                  />
                </div>

                {/* Payment Screenshot Upload */}
                <div className="sm:col-span-2">
                  <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                    PAYMENT SCREENSHOT ATTACHMENT <span className="text-[#C6FF00]">*</span>
                  </label>
                  <div className="border-2 border-dashed border-white/15 hover:border-[#C6FF00]/50 rounded-sm p-6 text-center bg-[#080808] transition-colors">
                    {screenshotPreview ? (
                      <div className="space-y-3">
                        <img
                          src={screenshotPreview}
                          alt="Uploaded Payment Screenshot"
                          className="max-h-48 mx-auto rounded-sm border border-white/15 object-contain"
                        />
                        <div className="font-mono text-xs text-[#BFC3C7]">
                          <span>{screenshotFile?.name}</span> ({(screenshotFile?.size ? screenshotFile.size / 1024 : 0).toFixed(0)} KB)
                        </div>
                        <label className="inline-block px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm font-mono-editorial text-xs cursor-pointer border border-white/15">
                          <span>REPLACE PROOF IMAGE</span>
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
                        <Upload className="w-8 h-8 text-[#C6FF00] mx-auto mb-2" />
                        <p className="font-editorial text-base font-bold text-white mb-1">
                          Upload Transaction Screenshot
                        </p>
                        <p className="font-mono-editorial text-[10px] text-zinc-400 mb-3">
                          UTR number and exact paid amount must be legible. JPG, PNG, WebP up to 10 MB.
                        </p>
                        <label className="inline-block px-5 py-2.5 bg-white/10 hover:bg-white/20 text-[#C6FF00] border border-[#C6FF00]/40 rounded-sm font-mono-editorial text-xs font-semibold cursor-pointer transition-colors">
                          <span>BROWSE SCREENSHOT</span>
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
                </div>
              </div>
            </div>

            {/* 3.4 OFFICIAL TERMS & EVENT POLICIES AND PARTICIPANT DECLARATION */}
            <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <div className="border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                    <span>SECTION 05 // LEGAL ACKNOWLEDGEMENT</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#C6FF00]" />
                    <span>OFFICIAL TERMS &amp; EVENT POLICIES</span>
                  </h3>
                </div>

                <div className="bg-[#080808] border border-white/10 rounded-sm p-5 text-xs sm:text-sm text-[#BFC3C7] space-y-3 font-light">
                  <div className="flex items-start space-x-3">
                    <span className="font-mono-editorial text-xs font-bold text-[#C6FF00] shrink-0 mt-0.5">01 //</span>
                    <p className="leading-relaxed">
                      <strong className="text-white font-medium">Non-Refundable &amp; Non-Transferable:</strong> All registration fees and advance tokens are strictly non-refundable and non-transferable under all circumstances.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="font-mono-editorial text-xs font-bold text-[#C6FF00] shrink-0 mt-0.5">02 //</span>
                    <p className="leading-relaxed">
                      <strong className="text-white font-medium">Organizer Authority:</strong> SKYRA CREATIONS reserves the right to approve, decline, or allocate showcase categories based on audition standards.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="font-mono-editorial text-xs font-bold text-[#C6FF00] shrink-0 mt-0.5">03 //</span>
                    <p className="leading-relaxed">
                      <strong className="text-white font-medium">Venue &amp; Schedule Announcement:</strong> Hosted in Chennai City Center. The exact auditorium address and call times are released 10 days prior to the show.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="font-mono-editorial text-xs font-bold text-[#C6FF00] shrink-0 mt-0.5">04 //</span>
                    <p className="leading-relaxed">
                      <strong className="text-white font-medium">Rehearsal Attendance:</strong> Stage presence orientation, turns, and rehearsals are mandatory for backstage pass issuance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Participant Declaration */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-mono-editorial text-xs font-bold text-[#C6FF00] uppercase tracking-wider mb-2">
                  PARTICIPANT DECLARATION
                </h4>
                
                <p className="text-xs text-[#BFC3C7] bg-[#080808] border border-white/10 rounded-sm p-4 leading-relaxed mb-4 italic font-light">
                  "I hereby confirm that all information provided during registration is accurate and complete. I have read, understood, and agreed to the event policies, including the non-refundable registration fee policy. I agree to comply with all rehearsal schedules, reporting times, dress codes, event instructions, and guidelines issued by SKYRA CREATIONS."
                </p>

                <label className="flex items-start space-x-3 cursor-pointer p-3.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded-sm border-zinc-700 bg-zinc-900 text-[#C6FF00] focus:ring-[#C6FF00] shrink-0"
                  />
                  <span className="font-mono-editorial text-xs text-white leading-relaxed font-medium">
                    I HAVE READ, UNDERSTOOD AND AGREE TO THE OFFICIAL TERMS &amp; PARTICIPANT DECLARATION.
                  </span>
                </label>
              </div>
            </div>

            {/* 3.5 SUBMISSION BUTTON */}
            <div>
              {uploadStatusText && (
                <div className="mb-4 text-center">
                  <p className="font-mono-editorial text-xs text-[#C6FF00] mb-2">{uploadStatusText}</p>
                  {uploadPercent > 0 && (
                    <div className="w-full bg-zinc-800 rounded-sm h-1.5 overflow-hidden max-w-md mx-auto">
                      <div
                        className="bg-[#C6FF00] h-1.5 transition-all duration-300"
                        style={{ width: `${uploadPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              <MagneticButton
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-sm font-mono-editorial text-xs font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-2 ${
                  loading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#C6FF00] hover:bg-[#D8FF33] text-black shadow-[#C6FF00]/20'
                }`}
              >
                <span>{loading ? 'SUBMITTING REGISTRATION DATA...' : 'SUBMIT RUNWAY REGISTRATION'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </MagneticButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
