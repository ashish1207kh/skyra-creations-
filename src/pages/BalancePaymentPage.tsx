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
  MapPin
} from 'lucide-react';
import { getPaymentInfo, lookupParticipant, submitBalancePayment } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo, Participant } from '../types/index';

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

  const allAmounts = [500, 1000, 1500, 2000, 2500, 3000, 3500];

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
        if (data.balance_due <= 3500 && allAmounts.includes(data.balance_due)) {
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
    const upi = paymentInfo?.upi_id || 'mr.death4646@oksbi';
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
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-[#12151e] border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Payment Submitted
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Payment Submission Received
          </h2>

          <p className="text-zinc-300 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
            Your payment proof has been submitted successfully. Your payment will be reflected in your verified balance after review by our team.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left">
            <div className="bg-black/60 border border-zinc-800 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Registration ID</span>
              <strong className="text-white font-mono text-lg">{successResult.reg_id}</strong>
            </div>
            <div className="bg-black/60 border border-zinc-800 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block mb-0.5">Payment Reference ID</span>
              <strong className="text-amber-400 font-mono text-sm">{successResult.payment_id}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#171a24] border border-zinc-800 text-xs text-zinc-300 text-left mb-8 space-y-2">
            <p className="font-bold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verification Policy &amp; Event Notice:</span>
            </p>
            <p>
              Payments are verified against bank settlement statements. Your updated balance and confirmed digital pass will be available once administrator approval is granted.
            </p>
            <p className="text-amber-300/90 border-t border-zinc-800 pt-2 flex items-center space-x-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Event location is in <strong>Chennai (City Center — Not outer)</strong>. Venue address &amp; show schedule announced 10 days before the show.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Check Registration &amp; Pass Status
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setTransactionId('');
                setTermsConfirmed(false);
                handleLookup(successResult.reg_id);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-all border border-zinc-700"
            >
              Submit Another Installment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter allowed payment amounts based on current outstanding balance
  const currentBalance = participantData?.balance_due || 0;
  const validAmounts = allAmounts.filter(amount => amount <= currentBalance);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Official Master Spec Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171a24] via-[#1b1f2c] to-[#171a24] border border-amber-500/30 rounded-3xl p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <CreditCard className="w-4 h-4" />
              <span>SKYRA CREATIONS — BALANCE PAYMENT PORTAL</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Complete Your Event Payment
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 mt-2 font-medium">
              Already registered for the Runway Show 2026? Use this portal to submit an additional payment towards your outstanding registration balance.
            </p>
          </div>

          <div className="shrink-0 bg-black/80 rounded-2xl p-2.5 border border-amber-500/30 shadow-xl self-start sm:self-center">
            <img 
              src="/logo.png" 
              alt="SKYRA CREATIONS — Balance Payment Portal Emblem" 
              width={112}
              height={112}
              className="w-24 sm:w-28 h-auto object-contain" 
            />
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-zinc-300 border-l-2 border-amber-500/60 pl-4 py-1 leading-relaxed">
          <p className="font-medium text-amber-200">
            Please enter your registration ID carefully so that your payment is associated with the correct participant record.
          </p>
          <p className="text-zinc-400">
            Important Notice: This portal is exclusively for existing participants. Your payment submission will be reviewed by our team before your balance is updated.
          </p>
        </div>
      </div>

      {/* Prominent Venue & Schedule Announcement */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#1d1610] to-[#12151e] border-2 border-amber-500/50 rounded-2xl p-5 mb-8 shadow-xl relative overflow-hidden">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 mt-0.5 shadow">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Event Location &amp; Announcement Schedule
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                Chennai (City Center — Not Outer)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              <strong className="text-white">Event Location:</strong> Hosted within <strong className="text-amber-300">Chennai city center (prime location, not outer areas)</strong>.
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <strong className="text-white">Venue Address &amp; Event Timings:</strong> The exact venue location and timing schedule will be <strong className="text-amber-300">officially announced 10 days before the show</strong> and shared with all participants via registered WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p className="text-xs sm:text-sm mt-0.5 text-red-300">{submitError}</p>
          </div>
        </div>
      )}

      {/* 4.1 REGISTRATION LOOKUP */}
      <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md mb-8">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Search className="w-5 h-5 text-amber-400" />
          <span>Find Your Registration</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6">
          Enter the registration ID received after submitting your registration.
        </p>

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
              placeholder="SC-2026-XXXX"
              className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 font-mono uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={lookupLoading}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
          >
            {lookupLoading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Registration</span>
              </>
            )}
          </button>
        </form>

        {lookupError && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{lookupError}</span>
          </div>
        )}

        {/* Participant Found & 4.2 PAYMENT SUMMARY */}
        {participantData && (
          <div className="mt-8 pt-6 border-t border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                  Verified Registration
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  {participantData.full_name}
                </h3>
                <p className="text-xs text-zinc-400">
                  ID: <span className="font-mono text-zinc-200">{participantData.reg_id}</span> • Category: <span className="text-zinc-200">{participantData.category}</span>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-zinc-400">Status:</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  participantData.status === 'FULLY_PAID'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : participantData.status === 'PARTIALLY_PAID'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                }`}>
                  {participantData.status === 'FULLY_PAID'
                    ? 'Fully Paid'
                    : participantData.status === 'PARTIALLY_PAID'
                    ? 'Partially Paid'
                    : 'Pending Verification'}
                </span>
              </div>
            </div>

            {/* 4.2 Payment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0a0c12] border border-zinc-800 rounded-xl p-4">
                <span className="text-xs text-zinc-400 block mb-1">Total Event Fee</span>
                <span className="text-xl font-bold text-white">₹{participantData.total_fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#0a0c12] border border-emerald-500/20 rounded-xl p-4">
                <span className="text-xs text-emerald-400 block mb-1">Verified Payments</span>
                <span className="text-xl font-bold text-emerald-400">₹{participantData.amount_paid.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#0a0c12] border border-amber-500/20 rounded-xl p-4">
                <span className="text-xs text-amber-400 block mb-1">Outstanding Balance</span>
                <span className="text-xl font-bold text-amber-400">₹{participantData.balance_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {participantData.balance_due === 0 && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs sm:text-sm text-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Your registration fee is fully settled. No additional payment is required!</span>
                </div>
                <button
                  onClick={() => {
                    if (setLookupRegId) setLookupRegId(participantData.reg_id);
                    setActiveTab('status');
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-lg text-xs hover:bg-emerald-400 shrink-0"
                >
                  View Digital Pass
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
          <div className="bg-[#12151e]/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="border-b border-zinc-800 pb-4 mb-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Choose Your Payment Amount</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Select an amount towards your remaining balance of <strong className="text-amber-400">₹{participantData.balance_due}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md shadow-amber-500/15'
                        : 'bg-[#0a0c12] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-lg font-extrabold">₹{amt.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Installment</div>
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
                className={`p-3.5 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 ${
                  isFullRemainingSelected
                    ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-md shadow-emerald-500/15'
                    : 'bg-[#0a0c12] border-zinc-800 text-emerald-400 hover:border-zinc-700'
                }`}
              >
                <div className="text-lg font-extrabold">₹{participantData.balance_due.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-300 mt-0.5">Pay Full Balance</div>
              </button>
            </div>

            <p className="text-[11px] text-zinc-500">
              Only amounts valid for your current outstanding balance are displayed.
            </p>
          </div>

          {/* 4.4 Payment Information & Screenshot Upload */}
          <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
            <div className="border-b border-zinc-800 pb-4 mb-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span>Submit Payment Details</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Scan the official QR code or copy the UPI ID below to pay <strong className="text-amber-400">₹{getEffectiveAmount().toLocaleString('en-IN')}</strong>.
              </p>
            </div>

            {/* UPI Details & QR */}
            <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3 text-sm text-zinc-300">
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
                    <strong className="text-amber-400 text-xl font-bold">₹{getEffectiveAmount().toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="text-center p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 flex flex-col items-center justify-center">
                  <img
                    src="/qr_code.png"
                    alt="Official SKYRA CREATIONS UPI QR Code for Balance Payment"
                    width={160}
                    height={160}
                    className="w-40 h-40 object-contain rounded-xl bg-white p-2 shadow-lg mb-2"
                  />
                  <p className="text-xs text-zinc-400 font-medium">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                </div>
              </div>
            </div>

            {/* Inputs: UTR, Date, Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* UTR */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  UPI Transaction ID / UTR <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter the 12-digit transaction reference"
                  className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Enter the transaction reference for this payment.
                </p>
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Transaction Date <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full bg-[#0a0c12] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 [color-scheme:dark]"
                  />
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Select the date on which the payment was made.</p>
              </div>

              {/* Screenshot Upload */}
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
                        Upload a clear screenshot showing the transaction details. Accepted formats: JPG, PNG, WebP (up to 10 MB).
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
              </div>
            </div>

            {/* Required Agreement */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsConfirmed}
                  onChange={(e) => setTermsConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-400 shrink-0"
                />
                <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  I confirm that I have completed this payment and that the transaction details provided above are accurate.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
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
              {loading ? 'Submitting payment for verification...' : 'Submit Payment for Verification'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
