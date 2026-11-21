import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  Copy, 
  Check, 
  Calendar, 
  QrCode, 
  MapPin, 
  ArrowRight,
  User,
  Sparkles,
  Lock,
  RefreshCw,
  Clock,
  Wallet,
  Phone,
  Image as ImageIcon,
  CheckCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPaymentInfo, lookupParticipant, submitBalancePayment, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo, Participant } from '../types/index';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import MagneticButton from '../components/MagneticButton';
import HumanVerificationCaptcha from '../components/HumanVerificationCaptcha';

export interface RegistrationDraft {
  full_name: string;
  email: string;
  dob: string;
  gender: string;
  mobile: string;
  whatsapp: string;
  city: string;
  category?: string;
  instagram?: string;
  experience?: string;
  modelPhotoFile: File | null;
  modelPhotoPreview: string | null;
}

interface PaymentPageProps {
  initialRegId?: string;
  initialMode?: 'balance' | 'register';
  registrationDraft?: RegistrationDraft | null;
  setActiveTab: (tab: string) => void;
  setLookupRegId?: (id: string) => void;
}

export default function PaymentPage({
  initialRegId = '',
  initialMode = 'register',
  registrationDraft = null,
  setActiveTab,
  setLookupRegId,
}: PaymentPageProps) {
  // Default to initialMode ('register' by default, or 'balance' when arriving from balance links)
  const [mode, setMode] = useState<'balance' | 'register'>(
    registrationDraft ? 'register' : initialMode
  );

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  // ─── BALANCE CLEARANCE STATE ───────────────────────────────────────
  const [regIdInput, setRegIdInput] = useState(initialRegId);
  const [participantData, setParticipantData] = useState<Participant | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Balance Form Fields
  const [selectedBalanceAmount, setSelectedBalanceAmount] = useState<number>(1000);
  const [isFullRemainingSelected, setIsFullRemainingSelected] = useState(false);
  const [balanceTxId, setBalanceTxId] = useState('');
  const [balanceScreenshotFile, setBalanceScreenshotFile] = useState<File | null>(null);
  const [balanceScreenshotPreview, setBalanceScreenshotPreview] = useState<string | null>(null);
  const [balanceTermsConfirmed, setBalanceTermsConfirmed] = useState(false);
  const [balanceCaptchaVerified, setBalanceCaptchaVerified] = useState(false);
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);
  const [balanceUploadPercent, setBalanceUploadPercent] = useState(0);
  const [balanceUploadStatus, setBalanceUploadStatus] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [balanceSuccess, setBalanceSuccess] = useState<{
    reg_id: string;
    payment_id: string;
    amount: number;
  } | null>(null);

  // ─── REGISTRATION PAYMENT STATE ────────────────────────────────────
  const [tokenAdvance, setTokenAdvance] = useState<number>(1000);
  const [regTxId, setRegTxId] = useState('');
  const [regScreenshotFile, setRegScreenshotFile] = useState<File | null>(null);
  const [regScreenshotPreview, setRegScreenshotPreview] = useState<string | null>(null);
  const [regTermsConfirmed, setRegTermsConfirmed] = useState(false);
  const [regCaptchaVerified, setRegCaptchaVerified] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regUploadPercent, setRegUploadPercent] = useState(0);
  const [regUploadStatus, setRegUploadStatus] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState<{
    reg_id: string;
    message: string;
    amount: number;
  } | null>(null);

  // Load Payment Info (official recipient, allowed advances/balances)
  useEffect(() => {
    getPaymentInfo()
      .then((data) => {
        setPaymentInfo(data);
        if (data.allowed_token_advances && data.allowed_token_advances.length > 0) {
          if (!data.allowed_token_advances.includes(tokenAdvance)) {
            setTokenAdvance(data.allowed_token_advances[1] || data.allowed_token_advances[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching payment info:', err));

    if (initialRegId) {
      handleLookup(initialRegId);
    }
  }, [initialRegId]);

  // Lookup Participant for Balance Clearance
  const handleLookup = async (idToSearch?: string) => {
    const q = (idToSearch || regIdInput).trim();
    if (!q) {
      setLookupError('Please enter your Registration ID (e.g. SC-2026-1001).');
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    setBalanceError('');

    try {
      const data = await lookupParticipant(q);
      setParticipantData(data);

      const allAmounts = paymentInfo?.allowed_balance_amounts || [500, 1000, 1500, 2000, 2500];
      if (data.balance_due > 0) {
        if (data.balance_due <= 3000 && allAmounts.includes(data.balance_due)) {
          setSelectedBalanceAmount(data.balance_due);
          setIsFullRemainingSelected(true);
        } else {
          const valid = allAmounts.filter((a) => a <= data.balance_due);
          setSelectedBalanceAmount(valid.length > 0 ? valid[valid.length - 1] : data.balance_due);
          setIsFullRemainingSelected(false);
        }
      }
    } catch (err: any) {
      setParticipantData(null);
      setLookupError(err.message || `No registration record found matching "${q}".`);
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle Balance Screenshot Selection
  const handleBalanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setBalanceError('Invalid image format. Please upload JPG, PNG, or WebP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setBalanceError('File size exceeds 10 MB maximum limit.');
        return;
      }
      setBalanceScreenshotFile(file);
      setBalanceError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setBalanceScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Balance Payment
  const handleBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBalanceError('');

    if (!participantData) {
      setBalanceError('Please look up your Registration ID first.');
      return;
    }

    const cleanTx = balanceTxId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setBalanceError('Please enter the valid 12-digit UPI transaction reference / UTR.');
      return;
    }

    if (!balanceScreenshotFile) {
      setBalanceError('Please upload a screenshot of your completed balance payment.');
      return;
    }

    if (!balanceTermsConfirmed) {
      setBalanceError('Please accept the non-refundable terms declaration to proceed.');
      return;
    }

    if (!balanceCaptchaVerified) {
      setBalanceError('Please complete the Human Verification security check below to proceed.');
      return;
    }

    setBalanceSubmitting(true);
    setBalanceUploadPercent(15);
    setBalanceUploadStatus('Uploading payment proof to secure storage...');

    try {
      const r2ObjectKey = await uploadFileToR2(balanceScreenshotFile, 'proofs', (pct) => {
        setBalanceUploadPercent(15 + Math.round(pct * 0.7));
      });

      setBalanceUploadStatus('Verifying and registering balance payment with SKYRA CREATIONS...');
      const response = await submitBalancePayment({
        reg_id: participantData.reg_id,
        full_name: participantData.full_name,
        amount: selectedBalanceAmount,
        transaction_id: cleanTx,
        r2_object_key: r2ObjectKey,
        terms_confirmed: true,
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setBalanceSuccess({
        reg_id: response.reg_id,
        payment_id: response.payment_id,
        amount: response.amount,
      });
    } catch (err: any) {
      setBalanceError(err.message || 'Balance payment submission failed. Please try again.');
    } finally {
      setBalanceSubmitting(false);
      setBalanceUploadStatus('');
    }
  };

  // Handle Registration Screenshot Selection
  const handleRegFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        setRegError('Invalid image format. Please upload JPG, PNG, or WebP.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setRegError('File size exceeds 10 MB maximum limit.');
        return;
      }
      setRegScreenshotFile(file);
      setRegError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Registration & Token Advance Payment
  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!registrationDraft || !registrationDraft.modelPhotoFile) {
      setRegError('Registration candidate credentials or model photo are missing. Please complete the registration form first.');
      return;
    }

    const cleanTx = regTxId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setRegError('Please enter the valid 12-digit UPI transaction reference / UTR.');
      return;
    }

    if (!regScreenshotFile) {
      setRegError('Please upload a screenshot of your completed token advance payment.');
      return;
    }

    if (!regTermsConfirmed) {
      setRegError('Please accept the Official Terms & Participant Declaration to proceed.');
      return;
    }

    if (!regCaptchaVerified) {
      setRegError('Please complete the Human Verification security check below to proceed.');
      return;
    }

    setRegSubmitting(true);
    setRegUploadPercent(10);
    setRegUploadStatus('Uploading model portrait photograph to secure storage...');

    try {
      // 1. Upload Model Photograph to R2 'photos' folder
      const modelPhotoKey = await uploadFileToR2(registrationDraft.modelPhotoFile, 'photos', (pct) => {
        setRegUploadPercent(Math.round(pct * 0.45));
      });

      // 2. Upload Payment Proof to R2 'proofs' folder
      setRegUploadStatus('Uploading payment proof to secure storage...');
      const r2ProofKey = await uploadFileToR2(regScreenshotFile, 'proofs', (pct) => {
        setRegUploadPercent(45 + Math.round(pct * 0.45));
      });

      // 3. Register with backend
      setRegUploadStatus('Finalizing registration with SKYRA CREATIONS desk...');
      const regResponse = await registerContestant({
        full_name: registrationDraft.full_name.trim(),
        email: registrationDraft.email.trim().toLowerCase(),
        dob: registrationDraft.dob,
        gender: registrationDraft.gender,
        mobile: registrationDraft.mobile.trim(),
        whatsapp: registrationDraft.whatsapp.trim(),
        city: registrationDraft.city.trim(),
        category: registrationDraft.category || 'Runway Model',
        height: null,
        instagram: registrationDraft.instagram?.trim() || null,
        experience: registrationDraft.experience?.trim() || null,
        model_photo_r2_key: modelPhotoKey,
        amount: tokenAdvance,
        transaction_id: cleanTx,
        r2_object_key: r2ProofKey,
        terms_confirmed: true,
        terms_version: paymentInfo?.terms_version || '2026.2',
      });

      confetti({
        particleCount: 140,
        spread: 85,
        origin: { y: 0.55 },
      });

      setRegSuccess({
        reg_id: regResponse.reg_id,
        message: regResponse.message,
        amount: tokenAdvance,
      });
    } catch (err: any) {
      setRegError(err.message || 'Registration payment failed. Please try again.');
    } finally {
      setRegSubmitting(false);
      setRegUploadStatus('');
    }
  };

  const totalFee = paymentInfo?.default_total_fee || 3000;
  const activeAmount = mode === 'balance' ? selectedBalanceAmount : tokenAdvance;

  // ───────────────────────────────────────────────────────────────────
  // SUCCESS VIEW: REGISTRATION PAYMENT COMPLETED
  // ───────────────────────────────────────────────────────────────────
  if (regSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-[#12141a] border border-[#C6FF00]/40 rounded-sm p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00]/40 flex items-center justify-center mx-auto mb-6 text-[#C6FF00]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="font-mono-editorial text-[11px] font-bold text-[#C6FF00] tracking-widest uppercase block mb-2">
            REGISTRATION &amp; TOKEN ADVANCE VERIFIED
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
            WELCOME TO SKYRA RUNWAY
          </h1>
          <p className="text-xs sm:text-sm text-[#BFC3C7] max-w-xl mx-auto font-light leading-relaxed mb-8">
            Your candidate submission and advance payment of ₹{regSuccess.amount.toLocaleString('en-IN')} have been logged with the official desk. Your spot has been tentatively reserved pending bank reference statement review.
          </p>

          {/* Registration Identifier Box */}
          <div className="bg-[#080808] border border-white/15 rounded-sm p-6 max-w-md mx-auto mb-8 shadow-inner">
            <p className="font-mono-editorial text-[10px] uppercase tracking-widest text-[#BFC3C7] mb-1">
              OFFICIAL REGISTRATION IDENTIFIER
            </p>
            <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[#C6FF00] tracking-wider select-all">
              {regSuccess.reg_id}
            </p>
            <p className="font-mono-editorial text-[10px] text-zinc-400 mt-2">
              Save or screenshot this ID for all official backstage and audition correspondence.
            </p>
          </div>

          {/* Venue & Rehearsal Policy */}
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
                <strong className="text-white">Call Sheets &amp; Schedule:</strong> Exact venue address and runway reporting schedules are released <strong className="text-[#C6FF00]">10 days before the show</strong> to your registered WhatsApp.
              </li>
              <li>
                <strong className="text-white">Balance Settlement:</strong> Clear your remaining balance prior to stage rehearsals via this Payment portal.
              </li>
              <li>
                <strong className="text-white">Digital Pass:</strong> Once your UTR is verified by accounts, your digital venue pass unlocks on the Status portal.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => {
                if (setLookupRegId) setLookupRegId(regSuccess.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C6FF00]/15"
            >
              TRACK REGISTRATION STATUS →
            </MagneticButton>
            <button
              onClick={() => {
                setRegSuccess(null);
                setRegIdInput(regSuccess.reg_id);
                setMode('balance');
                handleLookup(regSuccess.reg_id);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider border border-white/15"
            >
              VIEW BALANCE PORTAL
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // SUCCESS VIEW: BALANCE PAYMENT COMPLETED
  // ───────────────────────────────────────────────────────────────────
  if (balanceSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-[#12141a] border border-[#C6FF00]/40 rounded-sm p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00]/40 flex items-center justify-center mx-auto mb-6 text-[#C6FF00]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="font-mono-editorial text-[11px] font-bold text-[#C6FF00] tracking-widest uppercase block mb-2">
            BALANCE PAYMENT LOGGED
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-4">
            PAYMENT SUBMITTED SUCCESSFULLY
          </h1>
          <p className="text-xs sm:text-sm text-[#BFC3C7] max-w-xl mx-auto font-light leading-relaxed mb-8">
            Your installment payment of ₹{balanceSuccess.amount.toLocaleString('en-IN')} towards Registration ID <strong className="text-white font-mono">{balanceSuccess.reg_id}</strong> has been safely recorded. Reference ID: <span className="font-mono text-[#C6FF00]">{balanceSuccess.payment_id}</span>.
          </p>

          <div className="bg-[#080808] border border-white/15 rounded-sm p-6 max-w-md mx-auto mb-8 text-left space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#BFC3C7]">REGISTRATION ID:</span>
              <span className="text-white font-bold">{balanceSuccess.reg_id}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#BFC3C7]">PAYMENT RECEIPT:</span>
              <span className="text-white font-bold">{balanceSuccess.payment_id}</span>
            </div>
            <div className="flex justify-between text-xs font-mono border-t border-white/10 pt-2">
              <span className="text-[#BFC3C7]">AMOUNT SUBMITTED:</span>
              <span className="text-[#C6FF00] font-bold">₹{balanceSuccess.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => {
                if (setLookupRegId) setLookupRegId(balanceSuccess.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#C6FF00]/15"
            >
              CHECK PASS &amp; UPDATED BALANCE →
            </MagneticButton>
            <button
              onClick={() => {
                setBalanceSuccess(null);
                setBalanceTxId('');
                setBalanceScreenshotFile(null);
                setBalanceScreenshotPreview(null);
                handleLookup(balanceSuccess.reg_id);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider border border-white/15"
            >
              MAKE ANOTHER PAYMENT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────
  // MAIN PAYMENT PORTAL
  // ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Editorial Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <span className="font-mono-editorial text-[10px] sm:text-[11px] tracking-widest text-[#C6FF00] uppercase block">
          OFFICIAL FINANCIAL GATEWAY // CHENNAI 2026
        </span>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.08] text-white">
          PAYMENT &amp; BALANCE SETTLEMENT
        </h1>
        <p className="text-xs sm:text-sm text-[#BFC3C7] font-light leading-relaxed max-w-2xl mx-auto">
          Secure, bank-verified UPI payment gateway for SKYRA CREATIONS Runway Show 2026. Settle token advances, clear remaining balance installments, and upload bank transaction references.
        </p>

        {/* Dual Mode Switcher Tabs */}
        <div className="pt-2 sm:pt-4 flex items-center justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 p-1 rounded-sm bg-[#12141a] border border-white/15 w-full max-w-xl gap-1">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`px-3 sm:px-5 py-2.5 rounded-sm font-mono-editorial text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                mode === 'register'
                  ? 'bg-[#C6FF00] text-black shadow-lg shadow-[#C6FF00]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span>REGISTRATION TOKEN ADVANCE</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('balance')}
              className={`px-3 sm:px-5 py-2.5 rounded-sm font-mono-editorial text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                mode === 'balance'
                  ? 'bg-[#C6FF00] text-black shadow-lg shadow-[#C6FF00]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span>CLEAR REMAINING BALANCE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE A: CLEAR REMAINING BALANCE
      ───────────────────────────────────────────────────────────── */}
      {mode === 'balance' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Step 1: Participant Lookup */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-5 sm:p-7 shadow-xl max-w-4xl mx-auto">
            <div className="border-b border-white/10 pb-4 mb-6">
              <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block mb-1">
                STEP 01 // IDENTITY VERIFICATION
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                <Search className="w-5 h-5 text-[#C6FF00]" />
                <span>LOOK UP YOUR REGISTRATION RECORD</span>
              </h2>
              <p className="text-xs text-[#BFC3C7] font-light mt-1">
                Enter the official Registration ID generated during your initial model registration (e.g., <code className="text-[#C6FF00] font-mono">SC-2026-1001</code>).
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={regIdInput}
                  onChange={(e) => setRegIdInput(e.target.value.toUpperCase())}
                  placeholder="Enter Registration ID (e.g. SC-2026-1001)"
                  className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white font-mono placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                />
              </div>

              <MagneticButton
                type="submit"
                disabled={lookupLoading}
                className="px-8 py-3.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY RECORD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </MagneticButton>
            </form>

            {lookupError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-sm bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </motion.div>
            )}
          </div>

          {/* If Participant Found */}
          {participantData && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Contestant Financial Status Card */}
              <div className="bg-[#12141a] border border-white/10 rounded-sm p-5 sm:p-7 shadow-2xl max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                  <div>
                    <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block mb-1">
                      VERIFIED CONTESTANT PROFILE
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      {participantData.full_name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-1">
                      REGISTRATION ID: <strong className="text-white">{participantData.reg_id}</strong> · {participantData.category || 'Runway Model'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1.5 rounded-sm font-mono-editorial text-xs font-bold uppercase tracking-wider border ${
                        participantData.status === 'FULLY_PAID'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                          : participantData.status === 'PARTIALLY_PAID'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-red-950/60 text-red-300 border-red-500/40'
                      }`}
                    >
                      {participantData.status === 'FULLY_PAID'
                        ? 'FULLY CLEARED (₹0 DUE)'
                        : participantData.status === 'PARTIALLY_PAID'
                        ? 'PARTIALLY CLEARED'
                        : 'PAYMENT PENDING'}
                    </span>
                  </div>
                </div>

                {/* Financial Metric Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#080808] border border-white/10 p-5 rounded-sm">
                    <span className="font-mono-editorial text-[10px] text-[#BFC3C7] block uppercase">
                      TOTAL SHOWCASE FEE
                    </span>
                    <p className="font-mono text-2xl font-bold text-white mt-1">
                      ₹{participantData.total_fee.toLocaleString('en-IN')}
                    </p>
                    <span className="font-mono-editorial text-[10px] text-zinc-500 mt-1 block">
                      Runway Show 2026 Package
                    </span>
                  </div>

                  <div className="bg-[#080808] border border-white/10 p-5 rounded-sm">
                    <span className="font-mono-editorial text-[10px] text-[#BFC3C7] block uppercase">
                      VERIFIED CLEARED
                    </span>
                    <p className="font-mono text-2xl font-bold text-emerald-400 mt-1">
                      ₹{participantData.amount_paid.toLocaleString('en-IN')}
                    </p>
                    <span className="font-mono-editorial text-[10px] text-zinc-500 mt-1 block">
                      Confirmed by accounts desk
                    </span>
                  </div>

                  <div className="bg-[#080808] border border-[#C6FF00]/40 p-5 rounded-sm">
                    <span className="font-mono-editorial text-[10px] text-[#C6FF00] block uppercase font-bold">
                      BALANCE OUTSTANDING
                    </span>
                    <p className="font-mono text-2xl font-bold text-[#C6FF00] mt-1">
                      ₹{participantData.balance_due.toLocaleString('en-IN')}
                    </p>
                    <span className="font-mono-editorial text-[10px] text-zinc-400 mt-1 block">
                      {participantData.balance_due === 0 ? 'All dues cleared' : 'Due prior to stage call'}
                    </span>
                  </div>
                </div>
              </div>

              {/* If Balance is already ₹0 */}
              {participantData.balance_due === 0 ? (
                <div className="bg-[#12141a] border border-emerald-500/30 rounded-sm p-8 max-w-2xl mx-auto text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    ALL REGISTRATION DUES ARE FULLY SETTLED
                  </h3>
                  <p className="text-xs text-[#BFC3C7] font-light max-w-md mx-auto">
                    You have cleared 100% of your showcase participation fees. Your digital entry pass is available on the Status portal.
                  </p>
                  <MagneticButton
                    onClick={() => {
                      if (setLookupRegId) setLookupRegId(participantData.reg_id);
                      setActiveTab('status');
                    }}
                    className="px-8 py-3.5 rounded-sm bg-[#C6FF00] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider shadow-lg"
                  >
                    VIEW OFFICIAL DIGITAL PASS →
                  </MagneticButton>
                </div>
              ) : (
                /* Step 2: Installment Amount Selection & Payment Submission */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
                  {/* Left Column: Official Dynamic UPI QR */}
                  <div className="lg:col-span-5 space-y-6">
                    <DynamicUpiPayment
                      amount={selectedBalanceAmount}
                      registrationId={participantData.reg_id}
                      paymentType="BALANCE_PAYMENT"
                    />

                    {/* Venue Policy Announcement */}
                    <div className="bg-[#080808] border border-white/10 rounded-sm p-5 space-y-2 text-xs text-[#BFC3C7]">
                      <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase font-bold tracking-wider">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>VENUE LOCATION POLICY</span>
                      </div>
                      <p className="font-light">
                        Hosted in <strong className="text-white">Chennai City Center</strong> (urban auditorium, not outskirts). Exact venue and rehearsal schedules are released <strong className="text-[#C6FF00]">10 days before the show</strong> to your registered WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Settlement Form */}
                  <div className="lg:col-span-7 bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block mb-1">
                        STEP 02 // INSTALLMENT SELECTION &amp; PROOF
                      </span>
                      <h3 className="font-display text-2xl font-bold text-white flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-[#C6FF00]" />
                        <span>SUBMIT BALANCE CLEARANCE</span>
                      </h3>
                      <p className="text-xs text-[#BFC3C7] font-light mt-1">
                        Select the installment amount you are paying today, transfer via UPI to <strong className="text-white">B Sriram</strong>, and enter your 12-digit UTR reference.
                      </p>
                    </div>

                    <form onSubmit={handleBalanceSubmit} className="space-y-6">
                      {/* Amount Selection */}
                      <div>
                        <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-2.5">
                          SELECT PAYMENT AMOUNT <span className="text-[#C6FF00]">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {[500, 1000, 1500, 2000].map((amt) => {
                            const isAllowed = amt <= participantData.balance_due;
                            const isSelected = selectedBalanceAmount === amt && !isFullRemainingSelected;
                            return (
                              <button
                                key={amt}
                                type="button"
                                disabled={!isAllowed}
                                onClick={() => {
                                  setSelectedBalanceAmount(amt);
                                  setIsFullRemainingSelected(false);
                                }}
                                className={`p-3.5 rounded-sm border text-center transition-all ${
                                  isSelected
                                    ? 'bg-[#C6FF00]/15 border-[#C6FF00] text-white shadow-lg shadow-[#C6FF00]/10'
                                    : isAllowed
                                    ? 'bg-[#080808] border-white/15 text-zinc-300 hover:border-white/30'
                                    : 'bg-[#080808]/50 border-white/5 text-zinc-600 cursor-not-allowed'
                                }`}
                              >
                                <span className="font-mono-editorial text-[9px] block text-[#BFC3C7] uppercase">
                                  INSTALLMENT
                                </span>
                                <span className="font-mono text-base font-bold block mt-0.5">
                                  ₹{amt.toLocaleString('en-IN')}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Pay Full Remaining Balance Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBalanceAmount(participantData.balance_due);
                            setIsFullRemainingSelected(true);
                          }}
                          className={`mt-2.5 w-full p-3 sm:p-3.5 rounded-sm border font-mono-editorial text-xs font-bold uppercase tracking-wider transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left sm:text-center ${
                            isFullRemainingSelected || selectedBalanceAmount === participantData.balance_due
                              ? 'bg-[#C6FF00] text-black border-[#C6FF00] shadow-lg shadow-[#C6FF00]/20'
                              : 'bg-[#080808] border-[#C6FF00]/40 text-[#C6FF00] hover:bg-[#C6FF00]/10'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>CLEAR FULL BALANCE</span>
                            <span className="text-[10px] opacity-80 font-normal">(ALL OUTSTANDING DUES)</span>
                          </div>
                          <span className="font-mono text-sm sm:text-base font-black">₹{participantData.balance_due.toLocaleString('en-IN')}</span>
                        </button>
                      </div>

                      {/* Transaction ID / UTR */}
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                          <label className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7]">
                            UPI REFERENCE / UTR NUMBER <span className="text-[#C6FF00]">*</span>
                          </label>
                          <span className="font-mono-editorial text-[9px] text-[#C6FF00] font-bold bg-white/5 px-2 py-0.5 rounded-sm">
                            {balanceTxId.trim().length} / 12 DIGITS
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={balanceTxId}
                          onChange={(e) => setBalanceTxId(e.target.value.replace(/\s+/g, ''))}
                          placeholder="e.g. 412356789012"
                          className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white font-mono placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                        />
                        <p className="font-mono-editorial text-[10px] text-zinc-500 mt-1">
                          Visible on Google Pay / PhonePe / Paytm payment receipt under "UPI Transaction ID" or "UTR".
                        </p>
                      </div>

                      {/* Screenshot Upload */}
                      <div>
                        <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                          PAYMENT CONFIRMATION SCREENSHOT <span className="text-[#C6FF00]">*</span>
                        </label>
                        <div className="border border-dashed border-white/20 rounded-sm p-5 text-center bg-[#080808] hover:border-[#C6FF00]/40 transition-colors">
                          {balanceScreenshotPreview ? (
                            <div className="space-y-3">
                              <img
                                src={balanceScreenshotPreview}
                                alt="Payment Proof"
                                className="max-h-48 mx-auto rounded-sm border border-white/20 object-contain"
                              />
                              <div className="text-xs text-[#BFC3C7] flex items-center justify-center space-x-2 font-mono">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-white">{balanceScreenshotFile?.name}</span>
                              </div>
                              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-mono-editorial cursor-pointer">
                                <span>REPLACE SCREENSHOT</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleBalanceFileChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="py-2">
                              <Upload className="w-8 h-8 text-[#C6FF00] mx-auto mb-2" />
                              <p className="font-editorial text-sm font-bold text-white mb-1">
                                Upload UPI Payment Receipt Screenshot
                              </p>
                              <p className="font-mono-editorial text-[10px] text-zinc-400 mb-3">
                                JPG, PNG, or WebP up to 10 MB.
                              </p>
                              <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer shadow-lg">
                                <Upload className="w-3.5 h-3.5" />
                                <span>SELECT FROM DEVICE</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleBalanceFileChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Terms Declaration */}
                      <div className="p-4 rounded-sm bg-[#080808] border border-white/10">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            required
                            checked={balanceTermsConfirmed}
                            onChange={(e) => setBalanceTermsConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded-sm border-white/20 bg-black text-[#C6FF00] focus:ring-[#C6FF00]"
                          />
                          <span className="text-xs text-[#BFC3C7] leading-relaxed font-light">
                            I declare that this payment of <strong className="text-white font-mono">₹{selectedBalanceAmount.toLocaleString('en-IN')}</strong> is made towards my official registration (<strong className="text-white font-mono">{participantData.reg_id}</strong>) and is strictly non-refundable and non-transferable under all circumstances.
                          </span>
                        </label>
                      </div>

                      {balanceError && (
                        <div className="p-4 rounded-sm bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span>{balanceError}</span>
                        </div>
                      )}

                      {/* Progress Indicator */}
                      {balanceSubmitting && balanceUploadStatus && (
                        <div className="p-4 rounded-sm bg-[#080808] border border-[#C6FF00]/40 space-y-2">
                          <div className="flex justify-between font-mono-editorial text-[11px] text-[#C6FF00]">
                            <span>{balanceUploadStatus}</span>
                            <span>{balanceUploadPercent}%</span>
                          </div>
                          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#C6FF00] h-full transition-all duration-300"
                              style={{ width: `${balanceUploadPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Human Verification & Anti-DoS Security */}
                      <HumanVerificationCaptcha 
                        label="HUMAN VERIFICATION // BALANCE CLEARANCE"
                        onVerified={(v) => {
                          setBalanceCaptchaVerified(v);
                          setBalanceError('');
                        }} 
                      />

                      {/* Submit Button */}
                      <MagneticButton
                        type="submit"
                        disabled={balanceSubmitting || !balanceCaptchaVerified}
                        className="w-full py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {balanceSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>SUBMITTING BALANCE PAYMENT...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>CONFIRM &amp; SUBMIT PAYMENT (₹{selectedBalanceAmount.toLocaleString('en-IN')})</span>
                          </>
                        )}
                      </MagneticButton>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE B: REGISTRATION TOKEN ADVANCE PAYMENT
      ───────────────────────────────────────────────────────────── */}
      {mode === 'register' && (
        <div className="space-y-10 max-w-7xl mx-auto">
          {registrationDraft ? (
            /* User arrived with candidate details from RegistrationPage */
            <div className="space-y-8">
              {/* Candidate Credentials Card */}
              <div className="bg-[#12141a] border border-[#C6FF00]/30 rounded-sm p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                  <div>
                    <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block mb-1">
                      STEP 02 OF 02 // CANDIDATE RESERVATION
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      {registrationDraft.full_name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {registrationDraft.city} · {registrationDraft.mobile} · Category: <strong className="text-white">{registrationDraft.category || 'Runway Model'}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="self-start sm:self-auto px-4 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white font-mono-editorial text-[11px] font-semibold uppercase tracking-wider transition-colors border border-white/15"
                  >
                    ← EDIT DETAILS
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  {registrationDraft.modelPhotoPreview && (
                    <img
                      src={registrationDraft.modelPhotoPreview}
                      alt="Candidate Preview"
                      className="w-14 h-14 rounded-sm object-cover border border-[#C6FF00]/40 shrink-0 shadow-md"
                    />
                  )}
                  <p className="text-xs text-[#BFC3C7] font-light leading-relaxed">
                    Candidate profile validated. To complete your entry for <strong className="text-white">Runway Show 2026</strong>, select your token advance amount, complete UPI transfer to <strong className="text-[#C6FF00]">B Sriram</strong>, and enter your bank reference UTR.
                  </p>
                </div>
              </div>

              {/* Dual Column Layout: Left Dynamic UPI QR + Right Payment Submission */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Official Dynamic UPI QR */}
                <div className="lg:col-span-5 space-y-6">
                  <DynamicUpiPayment amount={tokenAdvance} />

                  <div className="bg-[#080808] border border-white/10 rounded-sm p-5 space-y-2 text-xs text-[#BFC3C7]">
                    <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase font-bold tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>VENUE &amp; SCHEDULE RELEASE</span>
                    </div>
                    <p className="font-light">
                      Hosted in <strong className="text-white">Chennai City Center</strong>. Exact auditorium address and call schedules are released <strong className="text-[#C6FF00]">10 days before the show</strong> to your registered WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Right Column: Order Summary & Submission Form */}
                <div className="lg:col-span-7 bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block">
                        FEE BREAKDOWN &amp; ADVANCE SELECTION
                      </span>
                      <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-bold">
                        TOTAL FEE: ₹{totalFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mt-1">
                      SELECT TOKEN ADVANCE AMOUNT
                    </h3>
                  </div>

                  {/* Token Advance Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[500, 1000, 1500].map((amt) => {
                      const isSelected = tokenAdvance === amt;
                      const rem = totalFee - amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTokenAdvance(amt)}
                          className={`p-4 rounded-sm border text-left transition-all ${
                            isSelected
                              ? 'bg-[#C6FF00]/15 border-[#C6FF00] text-white shadow-lg shadow-[#C6FF00]/10'
                              : 'bg-[#080808] border-white/15 text-zinc-400 hover:border-white/30'
                          }`}
                        >
                          <span className="font-mono-editorial text-[9px] font-bold uppercase tracking-wider text-[#C6FF00] block mb-1">
                            TOKEN ADVANCE
                          </span>
                          <span className="font-mono text-xl font-bold block text-white">
                            ₹{amt.toLocaleString('en-IN')}
                          </span>
                          <span className="font-mono-editorial text-[10px] text-zinc-400 block mt-1">
                            Balance: ₹{rem.toLocaleString('en-IN')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleRegSubmit} className="space-y-6">
                    {/* Transaction ID / UTR */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                        <label className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7]">
                          UPI REFERENCE / UTR NUMBER <span className="text-[#C6FF00]">*</span>
                        </label>
                        <span className="font-mono-editorial text-[9px] text-[#C6FF00] font-bold bg-white/5 px-2 py-0.5 rounded-sm">
                          {regTxId.trim().length} / 12 DIGITS
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={regTxId}
                        onChange={(e) => setRegTxId(e.target.value.replace(/\s+/g, ''))}
                        placeholder="e.g. 412356789012"
                        className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white font-mono placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] transition-colors"
                      />
                      <p className="font-mono-editorial text-[10px] text-zinc-500 mt-1">
                        Find this on your bank or payment app receipt under "UPI Ref", "UTR", or "Transaction No".
                      </p>
                    </div>

                    {/* Screenshot Upload */}
                    <div>
                      <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                        PAYMENT SCREENSHOT PROOF <span className="text-[#C6FF00]">*</span>
                      </label>
                      <div className="border border-dashed border-white/20 rounded-sm p-5 text-center bg-[#080808] hover:border-[#C6FF00]/40 transition-colors">
                        {regScreenshotPreview ? (
                          <div className="space-y-3">
                            <img
                              src={regScreenshotPreview}
                              alt="Payment Proof"
                              className="max-h-48 mx-auto rounded-sm border border-white/20 object-contain"
                            />
                            <div className="text-xs text-[#BFC3C7] flex items-center justify-center space-x-2 font-mono">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-white">{regScreenshotFile?.name}</span>
                            </div>
                            <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-mono-editorial cursor-pointer">
                              <span>REPLACE SCREENSHOT</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleRegFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="py-2">
                            <Upload className="w-8 h-8 text-[#C6FF00] mx-auto mb-2" />
                            <p className="font-editorial text-sm font-bold text-white mb-1">
                              Upload UPI Payment Receipt Screenshot
                            </p>
                            <p className="font-mono-editorial text-[10px] text-zinc-400 mb-3">
                              JPG, PNG, or WebP up to 10 MB.
                            </p>
                            <label className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer shadow-lg">
                              <Upload className="w-3.5 h-3.5" />
                              <span>SELECT FROM DEVICE</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleRegFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="p-4 rounded-sm bg-[#080808] border border-white/10">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={regTermsConfirmed}
                          onChange={(e) => setRegTermsConfirmed(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded-sm border-white/20 bg-black text-[#C6FF00] focus:ring-[#C6FF00]"
                        />
                        <span className="text-xs text-[#BFC3C7] leading-relaxed font-light">
                          I declare that all submitted personal details are true and match my legal ID. I understand and agree that this token advance of <strong className="text-white font-mono">₹{tokenAdvance.toLocaleString('en-IN')}</strong> is strictly non-refundable and non-transferable under all circumstances once committed.
                        </span>
                      </label>
                    </div>

                    {regError && (
                      <div className="p-4 rounded-sm bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {regSubmitting && regUploadStatus && (
                      <div className="p-4 rounded-sm bg-[#080808] border border-[#C6FF00]/40 space-y-2">
                        <div className="flex justify-between font-mono-editorial text-[11px] text-[#C6FF00]">
                          <span>{regUploadStatus}</span>
                          <span>{regUploadPercent}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#C6FF00] h-full transition-all duration-300"
                            style={{ width: `${regUploadPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Human Verification & Anti-DoS Security */}
                    <HumanVerificationCaptcha 
                      label="HUMAN VERIFICATION // ADVANCE PAYMENT"
                      onVerified={(v) => {
                        setRegCaptchaVerified(v);
                        setRegError('');
                      }} 
                    />

                    {/* Submit Button */}
                    <MagneticButton
                      type="submit"
                      disabled={regSubmitting || !regCaptchaVerified}
                      className="w-full py-4 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {regSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>FINALIZING REGISTRATION...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>COMPLETE REGISTRATION &amp; PAY ADVANCE (₹{tokenAdvance.toLocaleString('en-IN')})</span>
                        </>
                      )}
                    </MagneticButton>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            /* If user arrived at Registration Payment without a draft */
            <div className="bg-[#12141a] border border-white/10 rounded-sm p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center mx-auto text-[#C6FF00]">
                <User className="w-8 h-8" />
              </div>

              <div>
                <span className="font-mono-editorial text-[10px] text-[#C6FF00] uppercase tracking-widest block mb-1">
                  NEW CONTESTANT REGISTRATION
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  START YOUR REGISTRATION FIRST
                </h3>
                <p className="text-xs sm:text-sm text-[#BFC3C7] font-light mt-2 leading-relaxed">
                  To register for Runway Show 2026, please complete your personal information, contact credentials, and recent model photograph on our Registration form before submitting payment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <MagneticButton
                  onClick={() => setActiveTab('register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-sm bg-[#C6FF00] text-black font-mono-editorial text-xs font-bold uppercase tracking-wider shadow-lg"
                >
                  START REGISTRATION FORM →
                </MagneticButton>
                <button
                  type="button"
                  onClick={() => setMode('balance')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider border border-white/15"
                >
                  CLEAR EXISTING BALANCE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
