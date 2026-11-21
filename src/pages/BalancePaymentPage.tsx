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
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { getPaymentInfo, lookupParticipant, submitBalancePayment } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo, Participant } from '../types/index';
import DynamicUpiPayment from '../components/DynamicUpiPayment';
import MagneticButton from '../components/MagneticButton';

interface BalancePaymentPageProps {
  initialRegId?: string;
  setActiveTab: (tab: string) => void;
  setLookupRegId?: (id: string) => void;
}

export default function BalancePaymentPage({ initialRegId, setActiveTab, setLookupRegId }: BalancePaymentPageProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [regIdInput, setRegIdInput] = useState(initialRegId || '');
  const [participantData, setParticipantData] = useState<Participant | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Form Fields
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [isFullRemainingSelected, setIsFullRemainingSelected] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successResult, setSuccessResult] = useState<{ reg_id: string; payment_id: string; amount: number } | null>(null);

  const allAmounts = paymentInfo?.allowed_balance_amounts || [500, 1000, 1500, 2000, 2500];

  useEffect(() => {
    getPaymentInfo()
      .then(data => setPaymentInfo(data))
      .catch(err => console.error(err));

    if (initialRegId) {
      handleLookup(initialRegId);
    }
  }, [initialRegId]);

  const handleLookup = async (idToSearch?: string) => {
    const q = (idToSearch || regIdInput).trim();
    if (!q) {
      setLookupError('Please enter your Registration ID.');
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    setSubmitError('');

    try {
      const data = await lookupParticipant(q);
      setParticipantData(data);
      
      // Default payment amount selection logic
      if (data.balance_due > 0) {
        if (data.balance_due <= 3000 && allAmounts.includes(data.balance_due)) {
          setSelectedAmount(data.balance_due);
          setIsFullRemainingSelected(true);
        } else {
          // Select highest allowed amount that does not exceed balance
          const valid = allAmounts.filter(a => a <= data.balance_due);
          setSelectedAmount(valid.length > 0 ? valid[valid.length - 1] : data.balance_due);
          setIsFullRemainingSelected(false);
        }
      }
    } catch (err: any) {
      setParticipantData(null);
      setLookupError(err.message || `No registration record found matching "${q}". Please check your Registration ID.`);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('Screenshot file size exceeds 10 MB limit.');
        return;
      }
      setScreenshotFile(file);
      setSubmitError('');
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

  const getEffectiveAmount = (): number => {
    if (isFullRemainingSelected && participantData) {
      return participantData.balance_due;
    }
    return selectedAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!participantData) {
      setSubmitError('Please look up and select a valid participant registration first.');
      return;
    }

    const payAmount = getEffectiveAmount();
    if (payAmount <= 0) {
      setSubmitError('Payment amount must be greater than zero.');
      return;
    }

    if (payAmount > participantData.balance_due) {
      setSubmitError(`Payment amount cannot exceed the remaining balance of ₹${participantData.balance_due}.`);
      return;
    }

    const cleanTx = transactionId.trim();
    if (!cleanTx || cleanTx.length < 6) {
      setSubmitError('Please enter the UPI transaction reference / UTR number.');
      return;
    }

    if (!screenshotFile) {
      setSubmitError('Please upload a clear screenshot of your completed UPI payment.');
      return;
    }

    if (!termsConfirmed) {
      setSubmitError('Please confirm that you have completed this payment and that the details are accurate.');
      return;
    }

    setLoading(true);
    setUploadPercent(10);
    setUploadStatusText('Preparing secure payment proof upload...');

    try {
      // 1. Direct upload to Cloudflare R2
      setUploadStatusText('Uploading transaction screenshot to secure storage...');
      const r2ObjectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(percent);
      });

      // 2. Submit balance payment
      setUploadStatusText('Submitting balance payment for verification...');
      const res = await submitBalancePayment({
        reg_id: participantData.reg_id,
        full_name: participantData.full_name,
        amount: payAmount,
        transaction_id: cleanTx,
        r2_object_key: r2ObjectKey,
        terms_confirmed: true,
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessResult({
        reg_id: participantData.reg_id,
        payment_id: res.payment_id,
        amount: payAmount,
      });

    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting your balance payment.');
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
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

          <div className="w-16 h-16 bg-[#C6FF00]/10 border border-[#C6FF00]/30 rounded-sm flex items-center justify-center mx-auto mb-6 text-[#C6FF00]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-block px-3.5 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] font-mono-editorial text-[10px] font-bold uppercase tracking-widest mb-4">
            PAYMENT SUBMISSION RECEIVED // PENDING AUDIT
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
            BALANCE PAYMENT LOGGED.
          </h2>

          <p className="text-[#BFC3C7] text-sm sm:text-base max-w-lg mx-auto mb-8 font-light leading-relaxed">
            Your installment payment proof has been securely recorded. Verified amounts update automatically upon statement reconciliation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left font-mono">
            <div className="bg-[#080808] border border-white/15 rounded-sm p-4">
              <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400 block mb-0.5">Registration ID</span>
              <strong className="text-white text-lg tracking-wider">{successResult.reg_id}</strong>
            </div>
            <div className="bg-[#080808] border border-white/15 rounded-sm p-4">
              <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400 block mb-0.5">Payment Reference ID</span>
              <strong className="text-[#C6FF00] text-sm tracking-wider">{successResult.payment_id}</strong>
            </div>
          </div>

          <div className="p-5 rounded-sm bg-[#0d0f14] border border-white/10 text-xs text-[#BFC3C7] text-left mb-8 space-y-2 font-light">
            <p className="font-mono-editorial font-bold text-white uppercase text-[11px] flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C6FF00]" />
              <span>Settlement Notice &amp; Venue Details</span>
            </p>
            <p className="leading-relaxed">
              Payments are verified directly against bank settlement statements. Your updated balance and confirmed digital pass will reflect once verified.
            </p>
            <p className="text-zinc-300 border-t border-white/10 pt-2 flex items-center space-x-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#C6FF00] shrink-0" />
              <span>Venue is in <strong className="text-white">Chennai City Center</strong>. Exact address and timing released 10 days before the show.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#C6FF00]/15"
            >
              CHECK REGISTRATION &amp; PASS
            </MagneticButton>
            <button
              onClick={() => {
                setSuccessResult(null);
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setTransactionId('');
                setTermsConfirmed(false);
                handleLookup(successResult.reg_id);
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono-editorial text-xs font-semibold uppercase tracking-wider transition-all border border-white/15"
            >
              SUBMIT ANOTHER INSTALLMENT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter allowed payment amounts based on current outstanding balance
  const currentBalance = participantData?.balance_due || 0;
  const validAmounts = allAmounts.filter(amount => amount <= currentBalance);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
      {/* Master Spec Banner */}
      <div className="relative overflow-hidden bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] font-semibold tracking-widest uppercase mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              <span>SKYRA CREATIONS — BALANCE SETTLEMENT PORTAL</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.08]">
              SETTLE OUTSTANDING BALANCE.
            </h1>
            <p className="text-sm sm:text-base text-[#BFC3C7] mt-2 font-light">
              Already registered for the Runway Show 2026? Look up your registration ID and submit an installment or full balance clearance.
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
            Please enter your registration ID to load your live fee records.
          </p>
          <p className="text-zinc-400 font-mono-editorial text-[11px]">
            Exclusively for registered participants. Submissions are verified against bank settlement statements.
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
                VENUE ANNOUNCEMENT &amp; SCHEDULE
              </span>
              <span className="px-2 py-0.5 rounded-sm bg-white/10 text-white font-mono-editorial text-[10px] uppercase tracking-wider">
                Chennai (City Center)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white leading-relaxed font-light">
              <strong className="font-medium">Event Location:</strong> Central Chennai city center auditorium (prime location, not outer areas).
            </p>
            <p className="text-xs sm:text-sm text-[#BFC3C7] leading-relaxed font-light">
              <strong className="font-medium text-white">Venue Address &amp; Timings:</strong> Exact address &amp; call sheets are <strong className="text-[#C6FF00]">announced 10 days before the show</strong> and shared with all participants via registered WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {submitError && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-sm bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start space-x-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold font-mono-editorial uppercase text-xs">Submission Notice</p>
            <p className="text-xs mt-0.5 text-red-300 font-light">{submitError}</p>
          </div>
        </motion.div>
      )}

      {/* 4.1 REGISTRATION LOOKUP */}
      <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
        <div className="border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
            <span>STEP 01 // LOCATE RECORD</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
            <Search className="w-5 h-5 text-[#C6FF00]" />
            <span>FIND YOUR REGISTRATION</span>
          </h2>
          <p className="text-xs text-[#BFC3C7] font-light mt-1">
            Enter the registration ID received after submitting your registration.
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
              onChange={(e) => setRegIdInput(e.target.value)}
              placeholder="e.g. SC-2026-1001"
              className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3.5 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] font-mono uppercase tracking-wider"
            />
          </div>
          <MagneticButton
            type="submit"
            disabled={lookupLoading}
            className="px-8 py-3.5 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 shrink-0 active:scale-98"
          >
            {lookupLoading ? (
              <span>LOCATING RECORD...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>FIND REGISTRATION</span>
              </>
            )}
          </MagneticButton>
        </form>

        {lookupError && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-sm text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{lookupError}</span>
          </div>
        )}

        {/* Participant Found & 4.2 PAYMENT SUMMARY */}
        {participantData && (
          <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono-editorial text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-bold">
                  VERIFIED CANDIDATE FILE
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1.5">
                  {participantData.full_name}
                </h3>
                <p className="text-xs text-[#BFC3C7] font-mono mt-0.5">
                  ID: <span className="text-white font-bold">{participantData.reg_id}</span> • Category: <span className="text-white">{participantData.category}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-center">
                <span className={`font-mono-editorial text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm border ${
                  participantData.status === 'FULLY_PAID'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : participantData.status === 'PARTIALLY_PAID'
                    ? 'bg-[#C6FF00]/15 text-[#C6FF00] border-[#C6FF00]/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {participantData.status === 'FULLY_PAID'
                    ? 'Fully Paid'
                    : participantData.status === 'PARTIALLY_PAID'
                    ? 'Partially Paid'
                    : 'Under Review'}
                </span>
              </div>
            </div>

            {/* 4.2 Payment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#080808] border border-white/10 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">Total Fee</span>
                <span className="text-2xl font-bold text-white">₹{participantData.total_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#080808] border border-emerald-500/20 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">Verified Paid</span>
                <span className="text-2xl font-bold text-emerald-400">₹{participantData.amount_paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#080808] border border-[#C6FF00]/30 rounded-sm p-5">
                <span className="font-mono-editorial text-[10px] uppercase tracking-wider text-[#C6FF00] block mb-1">Balance Due</span>
                <span className="text-2xl font-bold text-[#C6FF00]">₹{participantData.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {participantData.balance_due === 0 && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-sm text-xs sm:text-sm text-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Your registration fee is fully settled. No additional payment is required!</span>
                </div>
                <button
                  onClick={() => {
                    if (setLookupRegId) setLookupRegId(participantData.reg_id);
                    setActiveTab('status');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-black font-mono-editorial text-xs font-bold uppercase rounded-sm hover:bg-emerald-400 shrink-0"
                >
                  VIEW DIGITAL PASS
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4.3 CHOOSE PAYMENT AMOUNT & 4.4 SUBMIT PAYMENT */}
      {participantData && participantData.balance_due > 0 && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount Selection */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
            <div className="border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                <span>STEP 02 // INSTALLMENT SELECTION</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#C6FF00]" />
                <span>CHOOSE PAYMENT AMOUNT</span>
              </h3>
              <p className="text-xs text-[#BFC3C7] font-light mt-1">
                Select an amount towards your remaining balance of <strong className="text-[#C6FF00] font-mono">₹{participantData.balance_due}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono">
              {validAmounts.map((amt) => {
                const isSelected = !isFullRemainingSelected && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setIsFullRemainingSelected(false);
                    }}
                    className={`p-4 rounded-sm border text-center transition-all ${
                      isSelected
                        ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-white font-bold shadow-md shadow-[#C6FF00]/15'
                        : 'bg-[#080808] border-white/15 text-zinc-300 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xl font-extrabold">₹{amt.toLocaleString('en-IN')}</div>
                    <div className="font-mono-editorial text-[10px] text-zinc-400 mt-1 uppercase">Installment</div>
                  </button>
                );
              })}

              {/* Pay Full Remaining Balance option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAmount(participantData.balance_due);
                  setIsFullRemainingSelected(true);
                }}
                className={`p-4 rounded-sm border text-center transition-all col-span-2 sm:col-span-1 ${
                  isFullRemainingSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-md shadow-emerald-500/15'
                    : 'bg-[#080808] border-white/15 text-emerald-400 hover:border-white/30'
                }`}
              >
                <div className="text-xl font-extrabold">₹{participantData.balance_due.toLocaleString('en-IN')}</div>
                <div className="font-mono-editorial text-[10px] text-emerald-300 mt-1 uppercase">Full Balance</div>
              </button>
            </div>

            <p className="font-mono-editorial text-[10px] text-zinc-500">
              Only amounts valid for your current balance are displayed.
            </p>
          </div>

          {/* 4.4 Payment Information & Screenshot Upload */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-6 sm:p-8 shadow-xl">
            <div className="border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center space-x-2 text-[#C6FF00] font-mono-editorial text-[10px] uppercase tracking-widest mb-1">
                <span>STEP 03 // UPI SUBMISSION</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-[#C6FF00]" />
                <span>SUBMIT PAYMENT DETAILS</span>
              </h3>
              <p className="text-xs text-[#BFC3C7] font-light mt-1">
                Scan the official QR code or copy the UPI ID below to pay <strong className="text-[#C6FF00] font-mono">₹{getEffectiveAmount().toLocaleString('en-IN')}</strong>.
              </p>
            </div>

            {/* Dynamic Server-Controlled UPI Payment Component */}
            <div className="mb-6">
              <DynamicUpiPayment
                amount={getEffectiveAmount()}
                paymentInfo={paymentInfo}
                registrationId={participantData.reg_id}
                paymentType="BALANCE_PAYMENT"
              />
            </div>

            {/* Inputs: UTR, Date, Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* UTR */}
              <div>
                <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                  12-DIGIT UPI TRANSACTION REF / UTR <span className="text-[#C6FF00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter 12-digit reference (e.g. 412345678901)"
                  className="w-full bg-[#080808] border border-white/15 rounded-sm px-4 py-3 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] font-mono tracking-wider"
                />
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                  TRANSACTION DATE <span className="text-[#C6FF00]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full bg-[#080808] border border-white/15 rounded-sm pl-10 pr-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-[#C6FF00] [color-scheme:dark]"
                  />
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Screenshot Upload */}
              <div className="sm:col-span-2">
                <label className="block font-mono-editorial text-[10px] uppercase tracking-wider text-[#BFC3C7] mb-1.5">
                  PAYMENT SCREENSHOT <span className="text-[#C6FF00]">*</span>
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
                        <span>CHANGE FILE</span>
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
                        Upload Your Transaction Screenshot
                      </p>
                      <p className="font-mono-editorial text-[10px] text-zinc-400 mb-3">
                        UTR and amount must be clearly legible. JPG, PNG, WebP up to 10 MB.
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

            {/* Required Agreement */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <label className="flex items-start space-x-3 cursor-pointer p-3.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/15 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-sm border-zinc-700 bg-zinc-900 text-[#C6FF00] focus:ring-[#C6FF00] shrink-0"
                />
                <span className="font-mono-editorial text-xs text-white leading-relaxed font-medium">
                  I CONFIRM THAT I HAVE COMPLETED THIS PAYMENT AND THAT THE TRANSACTION DETAILS PROVIDED ABOVE ARE ACCURATE.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
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
              <span>{loading ? 'SUBMITTING PAYMENT PROOF...' : 'SUBMIT PAYMENT FOR VERIFICATION'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </MagneticButton>
          </div>
        </form>
      )}
    </div>
  );
}
