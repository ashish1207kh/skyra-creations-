import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  User, 
  ShieldCheck, 
  Eye
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
  const [fullName, setFullName] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('2000');
  const [customAmount, setCustomAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successResult, setSuccessResult] = useState<{ reg_id: string; payment_id: string; amount: number } | null>(null);

  const predefinedAmounts = [500, 1000, 1500, 2000, 2500, 3000, 3500];

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
    if (!q) return;

    setLookupLoading(true);
    setLookupError('');
    setSubmitError('');

    try {
      const data = await lookupParticipant(q);
      setParticipantData(data);
      setFullName(data.full_name);
      
      // Auto-select amount that matches remaining balance if applicable
      if (data.balance_due > 0 && predefinedAmounts.includes(data.balance_due)) {
        setSelectedAmount(String(data.balance_due));
      } else if (data.balance_due > 0) {
        setSelectedAmount('custom');
        setCustomAmount(String(data.balance_due));
      }
    } catch (err: any) {
      setParticipantData(null);
      setLookupError(err.message || `No registration found matching "${q}". Please check your Registration ID.`);
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

  const getEffectiveAmount = () => {
    if (selectedAmount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(selectedAmount) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!termsConfirmed) {
      setSubmitError('Please confirm the terms and conditions checkbox.');
      return;
    }
    if (!screenshotFile) {
      setSubmitError('Please upload your payment screenshot.');
      return;
    }
    if (!transactionId.trim()) {
      setSubmitError('Please enter your Transaction ID / UTR ID.');
      return;
    }

    const finalAmount = getEffectiveAmount();
    if (finalAmount <= 0) {
      setSubmitError('Please select or enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      setUploadPercent(0);
      setUploadStatusText('Uploading proof directly to Cloudflare R2...');

      // 1. Upload to Cloudflare R2 via presigned PUT URL
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (p) => setUploadPercent(p));

      setUploadStatusText('Recording balance payment in database...');

      // 2. Submit to serverless API
      const res = await submitBalancePayment({
        reg_id: regIdInput.trim().toUpperCase(),
        full_name: fullName.trim(),
        amount: finalAmount,
        transaction_id: transactionId.trim(),
        r2_object_key: objectKey,
        terms_confirmed: true,
      });

      setSuccessResult({
        reg_id: res.reg_id,
        payment_id: res.payment_id,
        amount: res.amount,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting balance payment.');
    } finally {
      setLoading(false);
      setUploadStatusText('');
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (successResult) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-gradient-to-b from-[#141824] to-[#0d1017] border border-amber-500/40 rounded-2xl p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-white mb-2">
            Balance Payment Submitted!
          </h2>
          <p className="text-zinc-300 max-w-lg mx-auto mb-6 text-sm">
            Thank you, <span className="font-semibold text-white">{fullName}</span>. Your installment payment has been recorded and queued for admin verification.
          </p>

          <div className="bg-[#0b0d13]/80 border border-zinc-800 rounded-xl p-6 max-w-md mx-auto mb-8 text-left space-y-2 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 text-xs uppercase">Registration ID</span>
              <span className="font-mono text-base font-bold text-amber-400">{successResult.reg_id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Payment ID:</span>
              <span className="text-zinc-300 font-mono text-xs">{successResult.payment_id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Amount Paid Now:</span>
              <span className="text-white font-bold">₹{getEffectiveAmount()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Transaction / UTR:</span>
              <span className="text-zinc-300 font-mono text-xs">{transactionId}</span>
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-zinc-800">
              <span className="text-zinc-400">Verification:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                In Review
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 transition-all flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Check Verification & Status</span>
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setTransactionId('');
                setTermsConfirmed(false);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-all"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Official Master Spec Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#171a24] via-[#1b1f2c] to-[#171a24] border border-amber-500/30 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
              <CreditCard className="w-4 h-4" />
              <span>Official Balance Payment Form</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
              Skyra Creations Balance
            </h1>
          </div>

          <div className="shrink-0 bg-black/80 rounded-2xl p-2 border border-amber-500/30 shadow-xl self-start sm:self-center">
            <img 
              src="/logo.png" 
              alt="Skyra Creations Logo" 
              className="w-24 sm:w-28 h-auto object-contain"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-zinc-300 border-l-2 border-amber-500/50 pl-4 py-1">
          <p className="font-medium text-amber-200">
            This form is only for participants who have already registered and wish to make the remaining payment.
          </p>
          <p className="text-zinc-400">
            Please enter your registration id correctly and upload your payment proof.
          </p>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Registration ID Lookup */}
      <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md mb-8">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-zinc-800/80">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">1</div>
          <div>
            <h2 className="text-base font-bold text-white">Find Your Registration</h2>
            <p className="text-xs text-zinc-400">Enter the Registration ID shared by the Skyra Creations team</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="e.g. SC-2026-1002 or your registered mobile number"
              value={regIdInput}
              onChange={(e) => setRegIdInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={lookupLoading || !regIdInput.trim()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-sm transition-all shrink-0 disabled:opacity-50"
          >
            {lookupLoading ? 'Searching...' : 'Lookup Balance'}
          </button>
        </div>

        {lookupError && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300">
            {lookupError}
          </div>
        )}

        {/* Live Lookup Profile Card */}
        {participantData && (
          <div className="mt-6 bg-[#0a0c12] border border-amber-500/30 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
              <div>
                <span className="text-[11px] text-amber-400 uppercase tracking-widest font-semibold">Registered Participant</span>
                <h3 className="text-lg font-bold text-white">{participantData.full_name}</h3>
                <p className="text-xs text-zinc-400">{participantData.category} • {participantData.city}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Registration ID:</span>
                <span className="block font-mono text-sm font-bold text-amber-300">{participantData.reg_id}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 text-center">
              <div className="bg-[#12151e] p-3 rounded-lg border border-zinc-800">
                <div className="text-[11px] text-zinc-400 uppercase">Total Event Fee</div>
                <div className="text-base font-bold text-white">₹{participantData.total_fee}</div>
              </div>
              <div className="bg-[#12151e] p-3 rounded-lg border border-zinc-800">
                <div className="text-[11px] text-zinc-400 uppercase">Verified Paid</div>
                <div className="text-base font-bold text-emerald-400">₹{participantData.amount_paid}</div>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                <div className="text-[11px] text-amber-400 uppercase font-semibold">Balance Due</div>
                <div className="text-base font-bold text-amber-300">₹{participantData.balance_due}</div>
              </div>
            </div>

            {participantData.balance_due <= 0 && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>You have fully cleared all event registration payments! No further balance is required.</span>
                </div>
                <button
                  onClick={() => {
                    if (setLookupRegId) setLookupRegId(participantData.reg_id);
                    setActiveTab('status');
                  }}
                  className="px-3 py-1 bg-emerald-500 text-black font-semibold rounded text-xs hover:bg-emerald-400"
                >
                  View Pass
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section: Registration ID & Full Name */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
            <div>
              <h2 className="text-base font-bold text-white">Participant Verification</h2>
              <p className="text-xs text-zinc-400">Confirm the exact details used during registration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Registration ID <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">Enter the Registration ID shared by the Skyra Creations team.</p>
              <input
                type="text"
                required
                placeholder="e.g. SC-2026-1002"
                value={regIdInput}
                onChange={(e) => setRegIdInput(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Full Name <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">Please enter the same full name you used during registration.</p>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Amount Paying Now */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
            <div>
              <h2 className="text-base font-bold text-white">Amount Paying Now (₹) <span className="text-amber-400">*</span></h2>
              <p className="text-xs text-zinc-400">Please ensure that the selected amount matches the payment screenshot you upload.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {predefinedAmounts.map((amt) => (
              <label
                key={amt}
                className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                  selectedAmount === String(amt)
                    ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                    : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="amountRadio"
                  value={amt}
                  checked={selectedAmount === String(amt)}
                  onChange={() => {
                    setSelectedAmount(String(amt));
                    setCustomAmount('');
                  }}
                  className="sr-only"
                />
                <span className="text-base font-bold">₹{amt}</span>
              </label>
            ))}

            <label
              className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all ${
                selectedAmount === 'custom'
                  ? 'border-amber-500 bg-amber-500/20 text-white font-bold'
                  : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="amountRadio"
                value="custom"
                checked={selectedAmount === 'custom'}
                onChange={() => setSelectedAmount('custom')}
                className="sr-only"
              />
              <span className="text-xs font-semibold">Other Amount</span>
            </label>
          </div>

          {selectedAmount === 'custom' && (
            <div className="mt-3 max-w-xs">
              <label className="block text-xs text-zinc-400 mb-1">Enter custom amount in ₹</label>
              <input
                type="number"
                placeholder="e.g. 1750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-[#0a0c12] border border-amber-500/50 rounded-xl px-4 py-2.5 text-white font-bold"
              />
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-800/80">
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Transaction ID / UTR ID <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-zinc-400 mb-2">12-digit UPI reference number</p>
            <input
              type="text"
              required
              placeholder="e.g. UPI/428901823901"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono text-sm"
            />
          </div>
        </div>

        {/* Section: Scan and Pay QR Code + Upload Screenshot */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">4</div>
            <div>
              <h2 className="text-base font-bold text-white">Scan and Pay</h2>
              <p className="text-xs text-zinc-400">Scan via Google Pay or any UPI app & upload proof</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0a0c12] border border-zinc-800/80 rounded-2xl p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">Scan & Pay ₹{getEffectiveAmount()}</span>
              <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                <img
                  src={paymentInfo?.qr_code_url || "/qr_code.png"}
                  alt="Skyra Creations Google Pay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-2 text-xs text-zinc-400">
                <span>Google Pay • PhonePe • Paytm • UPI</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#12151e] p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-400">UPI ID:</div>
                <div className="font-mono text-base font-bold text-amber-400 select-all">
                  {paymentInfo?.upi_id || "mr.death4646@oksbi"}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Recipient: <span className="text-white font-medium">{paymentInfo?.upi_name || "Sanjay Mass"}</span></div>
              </div>

              <div className="bg-[#12151e] p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Paying now:</span>
                  <span className="text-xl font-bold text-amber-400">₹{getEffectiveAmount()}</span>
                </div>
              </div>

              <a
                href={`upi://pay?pa=${paymentInfo?.upi_id || 'mr.death4646@oksbi'}&pn=${encodeURIComponent(paymentInfo?.upi_name || 'Sanjay Mass')}&am=${getEffectiveAmount()}&cu=INR`}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-sm font-semibold border border-amber-500/30 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay via UPI App</span>
              </a>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-200 mb-1">
              Upload payment screenshot <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-zinc-400 mb-2">
              Stored securely in Cloudflare R2. Must show amount, Transaction id, date and time. Upload 1 supported file. Max 10 MB.
            </p>

            <div className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-5 text-center cursor-pointer bg-[#0a0c12] transition-colors">
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {screenshotPreview ? (
                <div className="flex items-center space-x-4">
                  <img src={screenshotPreview} alt="Screenshot preview" className="w-16 h-16 object-cover rounded-lg border border-zinc-700" />
                  <div className="text-left text-xs text-zinc-300 truncate">
                    <p className="font-semibold text-amber-400">{screenshotFile?.name}</p>
                    <p className="text-zinc-500">{((screenshotFile?.size || 0) / 1024).toFixed(0)} KB • Click to choose another file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-sm font-medium text-zinc-200">Add file</span>
                  <span className="text-xs text-zinc-500 mt-1">Upload 1 supported file. Max 10 MB.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Terms and Condition from PDF */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <h2 className="text-base font-bold text-white mb-3">Terms and Condition</h2>
          <ul className="text-xs text-zinc-400 space-y-1.5 mb-6 list-disc list-inside bg-[#0a0c12] p-4 rounded-xl border border-zinc-800/80">
            <li>Registration will be confirmed only after payment verification.</li>
            <li>Registration fee is non-refundable .</li>
            <li>False information may lead to rejection.</li>
            <li>Participants must follow the instructions.</li>
            <li>Skyra Creations reserves the right to accept or reject any registration.</li>
          </ul>

          <label className="flex items-start space-x-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsConfirmed}
              onChange={(e) => setTermsConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-amber-500 text-amber-500 focus:ring-0 w-4 h-4"
            />
            <span className="text-xs sm:text-sm text-zinc-200 font-medium">
              I confirm that the above details are correct. <span className="text-amber-400">*</span>
            </span>
          </label>
        </div>

        {/* Submit & Clear Buttons */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center space-x-3 transition-all ${
              loading
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black hover:opacity-95 hover:scale-[1.01]'
            }`}
          >
            {loading ? (
              <span>{uploadStatusText} ({uploadPercent}%)</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Balance Payment (₹{getEffectiveAmount()})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setRegIdInput('');
              setFullName('');
              setSelectedAmount('2000');
              setTransactionId('');
              setScreenshotFile(null);
              setScreenshotPreview(null);
              setTermsConfirmed(false);
              setParticipantData(null);
            }}
            className="px-6 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm font-medium transition-colors"
          >
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}
