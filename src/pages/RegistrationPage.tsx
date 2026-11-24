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
  X,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCheck,
  Award,
  Clock,
  Sparkle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPaymentInfo, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo } from '../types/index';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import MagneticButton from '../components/MagneticButton';
import InstagramIcon from '../components/InstagramIcon';
import HumanVerificationCaptcha from '../components/HumanVerificationCaptcha';
import { RegistrationDraft } from './PaymentPage';

interface RegistrationPageProps {
  setActiveTab: (tab: string) => void;
  setLookupRegId?: (id: string) => void;
  onProceedToPayment?: (draft: RegistrationDraft) => void;
}

const CATEGORY_OPTIONS = [
  { id: 'Adult Commercial & Couture', label: 'Adult Commercial & Couture', desc: 'Ages 18–35. High-fashion ramp and designer editorial walk.' },
  { id: 'Kids Category', label: 'Kids Runway (Ages 4–12)', desc: 'Confidence grooming and fun ramp walk for young aspirants.' },
  { id: 'Teens Category', label: 'Teens Runway (Ages 13–17)', desc: 'Pre-professional ramp choreography and stage posture.' },
  { id: 'Plus-Size & Fitness', label: 'Plus-Size & Fitness Category', desc: 'Celebrating body positivity, silhouette, and athletic presence.' },
  { id: 'Classic Category', label: 'Classic Category (Up to age 50)', desc: 'Timeless runway poise for experienced and mature models.' },
];

const EXPERIENCE_OPTIONS = [
  'Fresher (First Time on Runway)',
  'Intermediate (1–3 Prior Shows or Shoots)',
  'Experienced / Professional Model'
];

export default function RegistrationPage({ setActiveTab, setLookupRegId, onProceedToPayment }: RegistrationPageProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{ reg_id: string; message: string; amount: number } | null>(null);

  // ─── STEP 1: PERSONAL INFORMATION ─────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  // ─── STEP 2: MODEL PROFILE & PHOTOGRAPH ───────────────────────────────────
  const [category, setCategory] = useState('Adult Commercial & Couture');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('Fresher (First Time on Runway)');
  const [modelPhotoFile, setModelPhotoFile] = useState<File | null>(null);
  const [modelPhotoPreview, setModelPhotoPreview] = useState<string | null>(null);

  // ─── STEP 3: REVIEW & POLICIES ────────────────────────────────────────────
  const [teamCommitmentConfirmed, setTeamCommitmentConfirmed] = useState(false);
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // ─── STEP 4: TOKEN ADVANCE PAYMENT ────────────────────────────────────────
  const [tokenAdvance, setTokenAdvance] = useState<number>(1000);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');

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
      .catch(err => console.error('Error loading payment info', err));
  }, []);

  const totalFee = paymentInfo?.default_total_fee ?? 3000;
  const remainingBalance = Math.max(0, totalFee - tokenAdvance);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full legal name (minimum 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!dob) {
      setErrorMsg('Please select your date of birth.');
      return;
    }
    const cleanMobile = mobile.trim().replace(/[^0-9+]/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid calling mobile number (at least 10 digits).');
      return;
    }
    const cleanWhatsapp = whatsapp.trim().replace(/[^0-9+]/g, '');
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      setErrorMsg('Please enter a valid WhatsApp number for official event communication.');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your current city and state.');
      return;
    }

    setStepDirection('forward');
    setCurrentStep(2);
    scrollToTop();
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!modelPhotoFile) {
      setErrorMsg('Please upload a clear recent model photograph with your face visible.');
      return;
    }

    setStepDirection('forward');
    setCurrentStep(3);
    scrollToTop();
  };

  // Step 3 Validation -> Proceed to Step 4
  const handleProceedToStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!teamCommitmentConfirmed) {
      setErrorMsg('Please read and agree to the Team Commitment terms and conditions.');
      return;
    }
    if (!accuracyConfirmed) {
      setErrorMsg('Please confirm that your submitted credentials match your official ID.');
      return;
    }
    if (!termsConfirmed) {
      setErrorMsg('Please accept the Official Event Policies & Non-Refundable Token Advance terms.');
      return;
    }

    setStepDirection('forward');
    setCurrentStep(4);
    scrollToTop();
  };

  // Optional: Redirect to dedicated payment page if requested
  const handleProceedToDedicatedPaymentPage = () => {
    if (onProceedToPayment && modelPhotoFile) {
      onProceedToPayment({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        dob,
        gender,
        mobile: mobile.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        category,
        instagram: instagram.trim() || undefined,
        experience: experience.trim() || undefined,
        modelPhotoFile,
        modelPhotoPreview,
      });
    } else {
      setActiveTab('payment');
    }
  };

  // Final Step 4: Submit Registration & Payment
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTx = transactionId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setErrorMsg('Please enter the 12-digit UPI transaction reference / UTR number.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload a screenshot of your completed UPI token advance payment.');
      return;
    }
    if (!modelPhotoFile) {
      setErrorMsg('Model photograph missing. Please return to Step 2 to attach your photo.');
      return;
    }
    if (!isCaptchaVerified) {
      setErrorMsg('Please complete the Human Verification security check below to proceed.');
      return;
    }

    setLoading(true);
    setUploadPercent(10);
    setUploadStatusText('Uploading recent model photograph to secure storage...');

    try {
      // 1. Upload Model Photograph to Cloudflare R2 ('photos' folder)
      const modelPhotoKey = await uploadFileToR2(modelPhotoFile, 'photos', (percent) => {
        setUploadPercent(Math.round(percent * 0.45));
      });

      // 2. Upload Payment Screenshot to Cloudflare R2 ('proofs' folder)
      setUploadStatusText('Uploading payment confirmation screenshot to secure storage...');
      const r2ObjectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(45 + Math.round(percent * 0.45));
      });

      // 3. Register Contestant record
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

      // Multi-wave haute couture celebration confetti burst
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#C6FF00', '#D8FF33', '#FFD700', '#FFFFFF', '#38BDF8'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.65 },
          colors: ['#C6FF00', '#FFD700', '#FFFFFF'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.65 },
          colors: ['#C6FF00', '#FFD700', '#FFFFFF'],
        });
      }, 250);

      setSuccessResult({
        reg_id: regResponse.reg_id,
        message: regResponse.message,
        amount: tokenAdvance,
      });
      scrollToTop();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration. Please try again.');
    } finally {
      setLoading(false);
      setUploadPercent(0);
      setUploadStatusText('');
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SUCCESS SCREEN: REGISTRATION COMPLETE
  // ───────────────────────────────────────────────────────────────────────────
  if (successResult) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#12141a] border border-[#C6FF00]/40 rounded-sm p-6 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

          <div className="w-20 h-20 bg-[#C6FF00]/10 border border-[#C6FF00]/40 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C6FF00]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="font-mono-editorial text-[11px] font-bold text-[#C6FF00] tracking-widest uppercase block mb-2">
            SUBMISSION ACKNOWLEDGED // PENDING VERIFICATION
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
            WELCOME TO SKYRA RUNWAY
          </h1>
          <p className="text-xs sm:text-sm text-[#BFC3C7] max-w-xl mx-auto font-light leading-relaxed mb-8">
            Thank you, <strong className="text-white">{fullName}</strong>. Your candidate credentials and token advance payment of <strong className="text-[#C6FF00]">₹{successResult.amount.toLocaleString('en-IN')}</strong> have been securely transferred to the official verification queue.
          </p>

          {/* Official Registration Identifier */}
          <div className="bg-[#080808] border border-white/15 rounded-sm p-6 max-w-md mx-auto mb-8 shadow-inner">
            <p className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] mb-1">
              OFFICIAL REGISTRATION IDENTIFIER
            </p>
            <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[#C6FF00] tracking-wider select-all">
              {successResult.reg_id}
            </p>
            <p className="font-mono-editorial text-[10px] text-zinc-400 mt-2">
              Save or screenshot this ID for all official backstage and audition correspondence.
            </p>
          </div>

          {/* Next Steps & Rehearsal Policy */}
          <div className="text-left bg-[#080808] border border-white/10 rounded-sm p-6 mb-8 space-y-3">
            <h4 className="font-mono-editorial text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
              <span>Next Steps &amp; Venue Announcement</span>
            </h4>
            <ul className="text-xs sm:text-sm text-[#BFC3C7] space-y-2 list-disc list-inside font-light">
              <li>
                <strong className="text-white">Venue Location:</strong> Hosted strictly in <strong className="text-[#C6FF00]">Chennai City Center</strong> (prime urban auditorium, not remote outskirts).
              </li>
              <li>
                <strong className="text-white">Call Sheets &amp; Schedule:</strong> Exact venue address and runway reporting schedules are released <strong className="text-[#C6FF00]">10 days before the show</strong> to your registered WhatsApp ({whatsapp}).
              </li>
              <li>
                <strong className="text-white">Fee Settlement:</strong> You can clear your remaining balance of <strong className="text-white">₹{remainingBalance.toLocaleString('en-IN')}</strong> prior to stage rehearsals via the Payment page.
              </li>
              <li>
                <strong className="text-white">Digital Pass:</strong> Once your UTR is verified by accounts, your digital venue pass unlocks on the Status page.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C6FF00]/15"
            >
              TRACK REGISTRATION STATUS →
            </MagneticButton>
            <button
              onClick={() => {
                setActiveTab('payment');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider border border-white/15"
            >
              PAYMENT &amp; CLEARANCE
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MULTI-STEP WIZARD VIEW
  // ───────────────────────────────────────────────────────────────────────────
  const steps = [
    { number: 1, title: 'Personal Info', label: '01 PERSONAL' },
    { number: 2, title: 'Profile & Photo', label: '02 PROFILE & PHOTO' },
    { number: 3, title: 'Review & Terms', label: '03 REVIEW & TERMS' },
    { number: 4, title: 'Advance Payment', label: '04 PAYMENT' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      {/* ─── TOP WIZARD PROGRESS BAR (DESKTOP & MOBILE RESPONSIVE) ─────────── */}
      <div className="bg-[#12141a] border border-white/10 rounded-sm p-3.5 sm:p-5 shadow-xl">
        {/* Mobile Header / Step Indicator */}
        <div className="sm:hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase font-bold tracking-widest">
              STEP {currentStep} OF 4
            </span>
            <span className="font-mono-editorial text-[10px] text-zinc-400 uppercase tracking-wider">
              {steps[currentStep - 1].title}
            </span>
          </div>
          {/* Progress Bar Track */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C6FF00]"
              initial={{ width: '25%' }}
              animate={{ width: `${currentStep * 25}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Desktop Breadcrumb Navigation */}
        <div className="hidden sm:grid grid-cols-4 gap-4">
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <button
                key={s.number}
                type="button"
                disabled={currentStep < s.number}
                onClick={() => {
                  if (currentStep > s.number) {
                    setStepDirection(s.number < currentStep ? 'backward' : 'forward');
                    setCurrentStep(s.number);
                    setErrorMsg('');
                    scrollToTop();
                  }
                }}
                className={`flex items-center space-x-3 p-3 rounded-sm border transition-all text-left ${
                  isCurrent
                    ? 'bg-[#C6FF00]/10 border-[#C6FF00] shadow-lg shadow-[#C6FF00]/10'
                    : isCompleted
                    ? 'bg-white/5 border-white/15 text-white cursor-pointer hover:border-[#C6FF00]/40'
                    : 'bg-transparent border-white/5 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <div className={`w-7 h-7 rounded-sm flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-[#C6FF00] text-black'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/5 text-zinc-600'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <div className="min-w-0">
                  <span className={`block font-mono-editorial text-[9px] uppercase tracking-wider truncate ${
                    isCurrent ? 'text-[#C6FF00]' : isCompleted ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    {s.label}
                  </span>
                  <span className={`block font-editorial text-xs font-bold truncate ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>
                    {s.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── ERROR BANNER (IF ANY) ─────────────────────────────────────────── */}
      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-sm bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start space-x-3 shadow-xl"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold font-mono-editorial uppercase text-xs">Validation Required</p>
            <p className="text-xs mt-0.5 text-red-300 font-light">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {/* ─── MAIN TWO-COLUMN CONTAINER ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Founder & CEO Profile (Prominent Big Portrait) */}
        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 shadow-2xl relative overflow-hidden group">
            {/* Top architectural neon accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

            {/* Prominent Large Founder Portrait */}
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
                "We provide an accessible, transparent stage where contestants gain genuine catwalk grooming, high-resolution media captures, and certified industry accreditation."
              </p>

              {/* Event Location & Schedule Notice in Founder Card */}
              <div className="p-4 rounded-sm bg-[#080808] border border-white/10 space-y-3">
                <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] font-bold">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>VENUE: CHENNAI CITY CENTER</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-light leading-normal">
                  Hosted within <strong className="text-white">prime central Chennai</strong> (central auditorium, not remote outskirts).
                </p>

                <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] font-bold pt-2 border-t border-white/10">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>SCHEDULE RELEASE</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-light leading-normal">
                  Exact venue address and call sheets are released <strong className="text-white">10 days before the show</strong> to your registered WhatsApp.
                </p>
              </div>

              {/* Direct Helpline Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <a
                  href="https://wa.me/919342049287?text=Hello%20Sriram%20sir%2C%20I%20am%20inquiring%20about%20the%20Skyra%20Creations%20Runway%20Show%202026%20registration."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-sm bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-mono-editorial font-semibold transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WHATSAPP DESK (+91 93420 49287)</span>
                </a>

                <a
                  href="https://www.instagram.com/skyra_creations_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-mono-editorial font-semibold transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>@SKYRA_CREATIONS_</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Active Step Page */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* ═══════════════════════════════════════════════════════════════════
                STEP 1: PERSONAL DETAILS
            ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: stepDirection === 'forward' ? 36 : -36, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: stepDirection === 'forward' ? -36 : 36, filter: 'blur(3px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <div className="border-b border-white/10 pb-5">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>STEP 01 // CANDIDATE CREDENTIALS</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                    PERSONAL INFORMATION
                  </h2>
                  <p className="text-xs sm:text-sm text-[#BFC3C7] font-light mt-1">
                    Please provide your legal name and contact details matching your official ID card for accreditation.
                  </p>
                </div>

                <form onSubmit={handleProceedToStep2} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                        placeholder="Enter your full legal name as per government ID"
                        className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                      />
                    </div>

                    {/* Email */}
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
                          className="w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                        />
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
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
                          className="w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors [color-scheme:dark]"
                        />
                        <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                      </div>
                    </div>

                    {/* Gender Category */}
                    <div>
                      <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                        GENDER <span className="text-[#C6FF00]">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
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
                          className="w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                        />
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
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
                          className={`w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors ${
                            sameAsMobile ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        />
                        <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3.5 top-4" />
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
                          className="w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                        />
                        <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <MagneticButton
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>CONTINUE TO PROFILE &amp; PHOTO</span>
                      <ArrowRight className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 2: MODEL PROFILE & PHOTOGRAPH
            ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: stepDirection === 'forward' ? 36 : -36, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: stepDirection === 'forward' ? -36 : 36, filter: 'blur(3px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <div className="border-b border-white/10 pb-5">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>STEP 02 // CATEGORY &amp; PORTFOLIO</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                    MODEL PROFILE &amp; PHOTOGRAPH
                  </h2>
                  <p className="text-xs sm:text-sm text-[#BFC3C7] font-light mt-1">
                    Select your runway category and attach a recent portrait photograph.
                  </p>
                </div>

                <form onSubmit={handleProceedToStep3} className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-2.5">
                      CHOOSE SHOWCASE CATEGORY <span className="text-[#C6FF00]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const isSelected = category === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setCategory(opt.id)}
                            className={`p-4 rounded-sm border cursor-pointer transition-all relative overflow-hidden group select-none active:scale-[0.98] ${
                              isSelected
                                ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-white shadow-xl shadow-[#C6FF00]/15'
                                : 'bg-[#080808] border-white/15 text-zinc-300 hover:border-white/35 hover:bg-white/[0.02]'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                                <div className="absolute transform rotate-45 bg-[#C6FF00] text-black font-bold text-[8px] py-0.5 right-[-18px] top-[4px] w-[50px] text-center" />
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="font-editorial text-sm font-bold text-white flex items-center space-x-1.5">
                                <span>{opt.label}</span>
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'border-[#C6FF00] bg-[#C6FF00] scale-110 shadow-[0_0_8px_#C6FF00]' : 'border-zinc-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1.5 font-light leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prior Experience */}
                  <div>
                    <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-2">
                      PRIOR MODELLING EXPERIENCE <span className="text-[#C6FF00]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {EXPERIENCE_OPTIONS.map((exp) => {
                        const isSelected = experience === exp;
                        return (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setExperience(exp)}
                            className={`p-3 rounded-sm border text-xs font-mono-editorial transition-all text-left ${
                              isSelected
                                ? 'bg-[#C6FF00]/15 border-[#C6FF00] text-white'
                                : 'bg-[#080808] border-white/15 text-zinc-400 hover:border-white/30'
                            }`}
                          >
                            {exp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instagram Profile Handle (Optional) */}
                  <div>
                    <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                      INSTAGRAM PROFILE HANDLE <span className="text-zinc-500">(OPTIONAL)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@yourhandle"
                        className="w-full bg-[#080808] border border-white/15 rounded-sm pl-11 pr-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                      />
                      <InstagramIcon className="w-4 h-4 text-[#E1306C] absolute left-3.5 top-4" />
                    </div>
                  </div>

                  {/* Mandatory Photograph Upload */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#C6FF00]" />
                        <span>RECENT MODEL PHOTOGRAPH <span className="text-[#C6FF00]">*</span></span>
                      </label>
                      <span className="font-mono-editorial text-[9px] text-[#C6FF00] bg-[#C6FF00]/10 border border-[#C6FF00]/30 px-2 py-0.5 rounded-sm">
                        MANDATORY
                      </span>
                    </div>

                    <div className="border border-dashed border-white/20 hover:border-[#C6FF00]/50 rounded-sm p-6 text-center bg-[#080808] transition-colors">
                      {modelPhotoPreview ? (
                        <div className="space-y-4">
                          <div className="relative inline-block overflow-hidden rounded-sm border border-[#C6FF00]/40 shadow-2xl group">
                            <img
                              src={modelPhotoPreview}
                              alt="Model Preview"
                              className="max-h-64 max-w-xs mx-auto object-cover"
                            />
                            {/* Scanning Laser Beam */}
                            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent shadow-[0_0_12px_#C6FF00] animate-scanline pointer-events-none" />
                            
                            <button
                              type="button"
                              onClick={handleRemoveModelPhoto}
                              className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors z-10"
                              title="Remove photo"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono-editorial text-[10px] tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>PORTRAIT VERIFIED • READY FOR RUNWAY EVALUATION</span>
                          </div>
                          <div>
                            <label className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-mono-editorial cursor-pointer border border-white/15">
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
                        <div className="py-6">
                          <Upload className="w-10 h-10 text-[#C6FF00] mx-auto mb-3" />
                          <p className="font-editorial text-base font-bold text-white mb-1">
                            Upload Portrait or Full-Length Photo
                          </p>
                          <p className="font-mono-editorial text-[10px] text-zinc-400 mb-4 max-w-sm mx-auto">
                            JPG, PNG, or WebP up to 10 MB. Face must be clearly visible without heavy filters or sunglasses.
                          </p>
                          <label className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer shadow-lg active:scale-98">
                            <Upload className="w-3.5 h-3.5" />
                            <span>SELECT PHOTO FROM DEVICE</span>
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

                  {/* Actions */}
                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStepDirection('backward');
                        setCurrentStep(1);
                        setErrorMsg('');
                        scrollToTop();
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider rounded-sm border border-white/15 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK TO STEP 1</span>
                    </button>

                    <MagneticButton
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>CONTINUE TO REVIEW &amp; TERMS</span>
                      <ArrowRight className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 3: REVIEW & POLICIES DECLARATION
            ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: stepDirection === 'forward' ? 36 : -36, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: stepDirection === 'forward' ? -36 : 36, filter: 'blur(3px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <div className="border-b border-white/10 pb-5">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>STEP 03 // REVIEW &amp; DECLARATION</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                    REVIEW YOUR CREDENTIALS
                  </h2>
                  <p className="text-xs sm:text-sm text-[#BFC3C7] font-light mt-1">
                    Review your submitted details before proceeding to the token advance payment.
                  </p>
                </div>

                <form onSubmit={handleProceedToStep4} className="space-y-6">
                  {/* Summary Profile Card */}
                  <div className="bg-[#080808] border border-white/15 rounded-sm p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center space-x-4">
                        {modelPhotoPreview && (
                          <img
                            src={modelPhotoPreview}
                            alt="Model Preview"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm object-cover border border-[#C6FF00]/40 shrink-0 shadow-md"
                          />
                        )}
                        <div>
                          <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase block">
                            CANDIDATE PROFILE
                          </span>
                          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                            {fullName}
                          </h3>
                          <p className="text-xs text-zinc-400 font-light mt-0.5">
                            {category} · {gender} · Born {dob}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(1);
                          scrollToTop();
                        }}
                        className="text-xs font-mono-editorial text-[#C6FF00] hover:underline shrink-0"
                      >
                        EDIT INFO
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-mono-editorial text-[10px] text-zinc-500 block uppercase">
                          CALLING MOBILE &amp; WHATSAPP
                        </span>
                        <p className="text-white font-mono mt-0.5">
                          {mobile} {sameAsMobile ? '(Same on WhatsApp)' : `· WA: ${whatsapp}`}
                        </p>
                      </div>

                      <div>
                        <span className="font-mono-editorial text-[10px] text-zinc-500 block uppercase">
                          EMAIL ADDRESS
                        </span>
                        <p className="text-white font-mono mt-0.5 break-all">
                          {email}
                        </p>
                      </div>

                      <div>
                        <span className="font-mono-editorial text-[10px] text-zinc-500 block uppercase">
                          RESIDENCE / LOCATION
                        </span>
                        <p className="text-white mt-0.5">
                          {city}
                        </p>
                      </div>

                      <div>
                        <span className="font-mono-editorial text-[10px] text-zinc-500 block uppercase">
                          INSTAGRAM PROFILE
                        </span>
                        <p className="text-[#C6FF00] font-mono mt-0.5">
                          {instagram || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Package Summary */}
                  <div className="p-5 rounded-sm bg-[#080808] border border-white/10 space-y-3 text-xs">
                    <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase font-bold tracking-wider block">
                      OFFICIAL SHOWCASE PACKAGE SUMMARY
                    </span>
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-zinc-400">Total Runway Show 2026 Participation Fee</span>
                      <strong className="text-white font-mono text-sm">₹{totalFee.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/10">
                      <span className="text-zinc-400">Token Advance (Payable in Next Step)</span>
                      <strong className="text-[#C6FF00] font-mono text-sm">₹500 / ₹1,000 / ₹1,500</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400">Remaining Balance (Payable Prior to Event)</span>
                      <span className="text-zinc-300 font-mono">Deducted from Total Fee</span>
                    </div>
                  </div>

                  {/* Mandatory Declarations & Policy Agreement */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start space-x-3 p-3.5 rounded-sm bg-[#080808] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                      <input
                        type="checkbox"
                        required
                        checked={accuracyConfirmed}
                        onChange={(e) => setAccuracyConfirmed(e.target.checked)}
                        className="mt-0.5 rounded-sm border-zinc-700 bg-zinc-900 text-[#C6FF00] focus:ring-[#C6FF00]"
                      />
                      <span className="text-xs text-zinc-300 font-light leading-relaxed">
                        I confirm that the submitted candidate credentials, contact information, and model photograph are accurate and correspond to my legal identity.
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 p-3.5 rounded-sm bg-[#080808] border border-white/10 cursor-pointer hover:border-white/20 transition-colors">
                      <input
                        type="checkbox"
                        required
                        checked={termsConfirmed}
                        onChange={(e) => setTermsConfirmed(e.target.checked)}
                        className="mt-0.5 rounded-sm border-zinc-700 bg-zinc-900 text-[#C6FF00] focus:ring-[#C6FF00]"
                      />
                      <span className="text-xs text-zinc-300 font-light leading-relaxed">
                        I accept the <strong className="text-white">Official Event Policies (Version 2026.2)</strong>. I understand that the total participation fee is ₹3,000 and that all token advance payments are strictly non-refundable once committed.
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStepDirection('backward');
                        setCurrentStep(2);
                        setErrorMsg('');
                        scrollToTop();
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider rounded-sm border border-white/15 flex items-center justify-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK TO STEP 2</span>
                    </button>

                    <MagneticButton
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2"
                    >
                      <span>PROCEED TO ADVANCE PAYMENT</span>
                      <ArrowRight className="w-4 h-4" />
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                STEP 4: TOKEN ADVANCE PAYMENT & VERIFICATION
            ═══════════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: stepDirection === 'forward' ? 36 : -36, filter: 'blur(3px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: stepDirection === 'forward' ? -36 : 36, filter: 'blur(3px)' }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <div className="border-b border-white/10 pb-5">
                  <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>STEP 04 // TOKEN ADVANCE &amp; VERIFICATION</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white">
                    TOKEN ADVANCE PAYMENT
                  </h2>
                  <p className="text-xs sm:text-sm text-[#BFC3C7] font-light mt-1">
                    Select your token advance amount, scan the official UPI QR code, and enter your 12-digit transaction reference.
                  </p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* Advance Amount Selector */}
                  <div>
                    <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-2.5">
                      SELECT TOKEN ADVANCE AMOUNT <span className="text-[#C6FF00]">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[500, 1000, 1500].map((amt) => {
                        const isSelected = tokenAdvance === amt;
                        const bal = totalFee - amt;
                        return (
                          <div
                            key={amt}
                            onClick={() => setTokenAdvance(amt)}
                            className={`p-4 rounded-sm border cursor-pointer text-center transition-all ${
                              isSelected
                                ? 'bg-[#C6FF00]/15 border-[#C6FF00] shadow-lg shadow-[#C6FF00]/10'
                                : 'bg-[#080808] border-white/15 hover:border-white/30'
                            }`}
                          >
                            <span className="font-mono-editorial text-[10px] text-[#BFC3C7] block uppercase">
                              PAY TODAY
                            </span>
                            <span className="font-mono text-2xl font-bold text-[#C6FF00] block mt-0.5">
                              ₹{amt.toLocaleString('en-IN')}
                            </span>
                            <span className="font-mono-editorial text-[9px] text-zinc-400 block mt-1">
                              Balance Due: ₹{bal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Server Controlled Dynamic UPI Component */}
                  <div>
                    <DynamicUpiPayment
                      amount={tokenAdvance}
                      paymentInfo={paymentInfo}
                      paymentType="INITIAL_REGISTRATION"
                    />
                  </div>

                  {/* UTR Input */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                      <label className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7]">
                        UPI REFERENCE / UTR NUMBER <span className="text-[#C6FF00]">*</span>
                      </label>
                      <span className="font-mono-editorial text-[9px] text-[#C6FF00] font-bold bg-white/5 px-2 py-0.5 rounded-sm">
                        {transactionId.trim().length} / 12 DIGITS
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.replace(/\s+/g, ''))}
                      placeholder="e.g. 412356789012"
                      className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white font-mono placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                    />
                    <p className="font-mono-editorial text-[10px] text-zinc-500 mt-1">
                      Found on your Google Pay, PhonePe, or Paytm receipt under "UPI Transaction ID" or "UTR".
                    </p>
                  </div>

                  {/* Payment Screenshot */}
                  <div>
                    <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                      PAYMENT CONFIRMATION SCREENSHOT <span className="text-[#C6FF00]">*</span>
                    </label>
                    <div className="border border-dashed border-white/20 hover:border-[#C6FF00]/50 rounded-sm p-6 text-center bg-[#080808] transition-colors">
                      {screenshotPreview ? (
                        <div className="space-y-3">
                          <img
                            src={screenshotPreview}
                            alt="Payment Proof"
                            className="max-h-52 mx-auto rounded-sm border border-white/20 object-contain shadow-xl"
                          />
                          <div className="text-xs text-[#BFC3C7] flex items-center justify-center space-x-2 font-mono">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">{screenshotFile?.name}</span>
                          </div>
                          <div>
                            <label className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-mono-editorial cursor-pointer border border-white/15">
                              <span>REPLACE SCREENSHOT</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleScreenshotChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-8 h-8 text-[#C6FF00] mx-auto mb-2" />
                          <p className="font-editorial text-sm font-bold text-white mb-1">
                            Attach UPI Payment Receipt Screenshot
                          </p>
                          <p className="font-mono-editorial text-[10px] text-zinc-400 mb-3">
                            JPG, PNG, or WebP up to 10 MB.
                          </p>
                          <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer shadow-lg">
                            <Upload className="w-3.5 h-3.5" />
                            <span>UPLOAD SCREENSHOT</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Human Verification & Anti-DoS CAPTCHA */}
                  <HumanVerificationCaptcha 
                    onVerified={(v) => {
                      setIsCaptchaVerified(v);
                      setErrorMsg('');
                    }} 
                  />

                  {/* Upload Progress Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-sm bg-[#080808] border border-[#C6FF00]/40 space-y-3 shadow-2xl relative overflow-hidden"
                    >
                      {/* Laser beam scan */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent animate-laser pointer-events-none" />

                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-2 text-white">
                          <RefreshCw className="w-3.5 h-3.5 text-[#C6FF00] animate-spin" />
                          <span className="font-mono-editorial text-[11px] text-zinc-300">{uploadStatusText}</span>
                        </div>
                        <span className="text-[#C6FF00] font-bold font-mono text-sm">{uploadPercent}%</span>
                      </div>

                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#99CC00] via-[#C6FF00] to-white relative rounded-full transition-all duration-300"
                          style={{ width: `${uploadPercent}%` }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#C6FF00]" />
                        </motion.div>
                      </div>

                      <div className="flex justify-between text-[10px] font-mono-editorial text-zinc-400 pt-0.5">
                        <span>TRANSMITTING ENCRYPTED APPLICATION</span>
                        <span>DO NOT REFRESH</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setStepDirection('backward');
                        setCurrentStep(3);
                        setErrorMsg('');
                        scrollToTop();
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider rounded-sm border border-white/15 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>BACK TO REVIEW</span>
                    </button>

                    <MagneticButton
                      type="submit"
                      disabled={loading || !isCaptchaVerified}
                      className="w-full sm:w-auto px-9 py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-xl flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span>PROCESSING REGISTRATION...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>SUBMIT REGISTRATION &amp; PAY ₹{tokenAdvance.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
