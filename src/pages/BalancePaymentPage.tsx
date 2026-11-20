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
  Eye,
  Copy,
  Check,
  ArrowRight
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
  const [copiedUpi, setCopiedUpi] = useState(false);

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

  const copyUpiId = () => {
    const id = paymentInfo?.upi_id || 'mr.death4646@oksbi';
    navigator.clipboard.writeText(id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
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
      setSubmitError('Please confirm the terms and conditions declaration.');
      return;
    }
    if (!screenshotFile) {
      setSubmitError('Please upload your payment screenshot proof.');
      return;
    }
    if (!transactionId.trim()) {
      setSubmitError('Please enter your 12-digit UPI Transaction ID / UTR.');
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
      setUploadStatusText('Uploading proof directly to Cloudflare R2 storage...');

      // 1. Upload to Cloudflare R2 via presigned PUT URL
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (p) => setUploadPercent(p));

      setUploadStatusText('Recording balance payment installment...');

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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#B8E34B', '#FFFFFF', '#A5AAA5']
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
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-8 sm:p-12 shadow-luxury text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-charcoal-surface border border-lime-accent/40 text-lime-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lime-glow">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase tracking-widest text-lime-accent font-mono block mb-2">Installment Submitted</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-ivory mb-3">
            Balance Payment Recorded
          </h2>
          <p className="text-charcoal-muted text-sm max-w-md mx-auto mb-8 font-light">
            Thank you, <strong className="text-ivory font-medium">{fullName}</strong>. Your payment screenshot and UTR have been transmitted for administrative bank review.
          </p>

          <div className="bg-[#101213] border border-charcoal-border rounded-card p-6 max-w-md mx-auto mb-8 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-charcoal-border">
              <span className="text-xs uppercase tracking-wider text-charcoal-muted font-mono">Registration ID</span>
              <span className="font-mono text-base font-bold text-lime-accent">{successResult.reg_id}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Payment Ref ID:</span>
              <span className="text-ivory font-mono text-xs">{successResult.payment_id}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Amount Submitted:</span>
              <span className="text-lime-accent font-bold tabular-nums">₹{getEffectiveAmount().toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-charcoal-muted">Transaction ID / UTR:</span>
              <span className="text-charcoal-muted font-mono text-xs">{transactionId}</span>
            </div>
            <div className="pt-3 flex justify-between items-center text-xs sm:text-sm border-t border-charcoal-border">
              <span className="text-charcoal-muted">Review Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-pending/10 text-status-pending border border-status-pending/20">
                Pending Bank Verification
              </span>
            </div>
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
              <span>Check Verification & Pass</span>
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
              Submit Another Installment
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
          <CreditCard className="w-3.5 h-3.5" />
          <span>Official Balance Settlement</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-ivory mb-3">
          SKYRA CREATIONS — BALANCE PORTAL
        </h1>
        <p className="text-charcoal-muted text-sm max-w-xl mx-auto font-light leading-relaxed">
          For contestants who have completed advance registration. Enter your Registration ID to inspect your balance and submit your installment proof.
        </p>
      </div>

      {submitError && (
        <div className="mb-8 p-4 rounded-card bg-status-rejected/10 border border-status-rejected/30 text-ivory text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-status-rejected shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-status-rejected">Notice</p>
            <p className="text-charcoal-muted mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Step 1: Registration ID Lookup */}
      <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle mb-8">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
          <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
            01
          </div>
          <div>
            <h2 className="font-editorial text-2xl text-ivory">Participant Account Lookup</h2>
            <p className="text-xs text-charcoal-muted">Search by Registration ID or registered mobile number</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="e.g. SC-2026-1001 or mobile number"
              value={regIdInput}
              onChange={(e) => setRegIdInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent font-mono text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={lookupLoading || !regIdInput.trim()}
            className="px-6 py-3 bg-lime-accent hover:bg-[#c9f556] text-charcoal font-semibold rounded-btn text-xs uppercase tracking-wider transition-all shrink-0 disabled:opacity-50 shadow-lime-glow"
          >
            {lookupLoading ? 'Searching...' : 'Lookup Balance'}
          </button>
        </div>

        {lookupError && (
          <div className="mt-4 p-3 bg-status-rejected/10 border border-status-rejected/30 rounded-card text-xs text-status-rejected">
            {lookupError}
          </div>
        )}

        {/* Live Lookup Profile Card */}
        {participantData && (
          <div className="mt-6 bg-[#101213] border border-charcoal-border rounded-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-border gap-2">
              <div>
                <span className="text-[11px] font-mono text-lime-accent uppercase tracking-widest block mb-1">
                  Verified Contestant
                </span>
                <h3 className="font-editorial text-2xl text-ivory">{participantData.full_name}</h3>
                <p className="text-xs text-charcoal-muted">{participantData.category} • {participantData.city}</p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-charcoal-muted block font-mono">Registration ID</span>
                <span className="font-mono text-base font-bold text-lime-accent">{participantData.reg_id}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-5 text-center">
              <div className="bg-charcoal-card p-4 rounded-card border border-charcoal-border">
                <div className="text-[11px] font-mono uppercase text-charcoal-muted mb-1">Total Fee</div>
                <div className="text-base sm:text-lg font-bold text-ivory tabular-nums">
                  ₹{participantData.total_fee.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-charcoal-card p-4 rounded-card border border-charcoal-border">
                <div className="text-[11px] font-mono uppercase text-charcoal-muted mb-1">Verified Paid</div>
                <div className="text-base sm:text-lg font-bold text-status-success tabular-nums">
                  ₹{participantData.amount_paid.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-charcoal-surface p-4 rounded-card border border-lime-accent/40 shadow-sm">
                <div className="text-[11px] font-mono uppercase text-lime-accent font-semibold mb-1">Balance Due</div>
                <div className="text-base sm:text-lg font-bold text-lime-accent tabular-nums">
                  ₹{participantData.balance_due.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {participantData.balance_due <= 0 && (
              <div className="mt-5 p-4 rounded-card bg-status-success/10 border border-status-success/30 text-ivory text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-status-success">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your registration fee has been 100% verified and cleared! No outstanding balance.</span>
                </div>
                <button
                  onClick={() => {
                    if (setLookupRegId) setLookupRegId(participantData.reg_id);
                    setActiveTab('status');
                  }}
                  className="px-4 py-2 bg-status-success text-charcoal font-semibold rounded-btn text-xs uppercase tracking-wider hover:opacity-90"
                >
                  View Digital Pass
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 2: Participant Verification */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              02
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Confirm Participant Identity</h2>
              <p className="text-xs text-charcoal-muted">Confirm the exact details registered in the event database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Registration ID <span className="text-lime-accent">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SC-2026-1001"
                value={regIdInput}
                onChange={(e) => setRegIdInput(e.target.value)}
                className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
                Full Registered Name <span className="text-lime-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-muted" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#101213] border border-charcoal-border rounded-input pl-10 pr-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Amount Paying Now */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              03
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Amount Paying Now (₹)</h2>
              <p className="text-xs text-charcoal-muted">Ensure your selected amount matches the payment screenshot you upload</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {predefinedAmounts.map((amt) => (
              <label
                key={amt}
                className={`p-3.5 rounded-card border cursor-pointer text-center transition-all ${
                  selectedAmount === String(amt)
                    ? 'border-lime-accent bg-charcoal-surface text-lime-accent shadow-sm'
                    : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border hover:text-ivory'
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
                <span className="text-base font-bold tabular-nums">₹{amt}</span>
              </label>
            ))}

            <label
              className={`p-3.5 rounded-card border cursor-pointer text-center transition-all ${
                selectedAmount === 'custom'
                  ? 'border-lime-accent bg-charcoal-surface text-lime-accent shadow-sm'
                  : 'border-charcoal-border bg-[#101213] text-charcoal-muted hover:border-charcoal-border hover:text-ivory'
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
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Custom</span>
            </label>
          </div>

          {selectedAmount === 'custom' && (
            <div className="mt-3 max-w-xs">
              <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-1">
                Custom Installment (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 1750"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-[#101213] border border-lime-accent/50 rounded-input px-4 py-2.5 text-ivory font-bold tabular-nums"
              />
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-charcoal-border">
            <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
              Transaction ID / UTR Number <span className="text-lime-accent">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="12-digit UPI reference number from your receipt"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full bg-[#101213] border border-charcoal-border rounded-input px-4 py-3 text-ivory placeholder-charcoal-muted/50 focus:outline-none focus:border-lime-accent font-mono text-sm"
            />
          </div>
        </div>

        {/* Step 4: Scan and Pay QR Code + Upload Screenshot */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-charcoal-border">
            <div className="w-7 h-7 rounded-btn bg-charcoal-surface border border-charcoal-border text-lime-accent flex items-center justify-center font-mono text-xs font-semibold">
              04
            </div>
            <div>
              <h2 className="font-editorial text-2xl text-ivory">Manual UPI Transfer & Proof</h2>
              <p className="text-xs text-charcoal-muted">Transfer exact amount to official merchant UPI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#101213] border border-charcoal-border rounded-card p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-mono tracking-widest text-lime-accent mb-3">
                Scan & Pay ₹{getEffectiveAmount().toLocaleString('en-IN')}
              </span>
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
                <span className="text-xs text-charcoal-muted">Paying now:</span>
                <span className="text-xl font-bold text-lime-accent tabular-nums">
                  ₹{getEffectiveAmount().toLocaleString('en-IN')}
                </span>
              </div>

              <a
                href={`upi://pay?pa=${paymentInfo?.upi_id || 'mr.death4646@oksbi'}&pn=${encodeURIComponent(paymentInfo?.upi_name || 'Sanjay Mass')}&am=${getEffectiveAmount()}&cu=INR`}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-btn bg-charcoal-surface hover:bg-charcoal-card text-lime-accent text-xs uppercase font-mono tracking-wider border border-charcoal-border transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay via UPI App</span>
              </a>
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-charcoal-muted font-mono mb-2">
              Upload Payment Screenshot <span className="text-lime-accent">*</span>
            </label>
            <p className="text-xs text-charcoal-muted mb-2 font-light">
              Stored securely in Cloudflare R2 private bucket. Must clearly show amount, UTR/Transaction ID, date and time. Max 10 MB.
            </p>

            <div className="relative border-2 border-dashed border-charcoal-border hover:border-lime-accent/50 rounded-card p-5 text-center cursor-pointer bg-[#101213] transition-colors">
              <input
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {screenshotPreview ? (
                <div className="flex items-center space-x-4">
                  <img src={screenshotPreview} alt="Screenshot preview" className="w-16 h-16 object-cover rounded-btn border border-charcoal-border" />
                  <div className="text-left text-xs truncate">
                    <p className="font-semibold text-lime-accent">{screenshotFile?.name}</p>
                    <p className="text-charcoal-muted">{((screenshotFile?.size || 0) / 1024).toFixed(0)} KB • Click to choose another file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-6 h-6 text-charcoal-muted mb-2" />
                  <span className="text-xs font-medium text-ivory">Click to upload payment screenshot</span>
                  <span className="text-[11px] text-charcoal-muted font-mono mt-0.5">JPG, PNG, WebP up to 10 MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Terms and Conditions */}
        <div className="bg-charcoal-card border border-charcoal-border rounded-section p-6 sm:p-8 shadow-card-subtle">
          <h2 className="font-editorial text-2xl text-ivory mb-3">Terms & Conditions Declaration</h2>
          <ul className="text-xs text-charcoal-muted space-y-1.5 mb-6 list-disc list-inside bg-[#101213] p-4 rounded-card border border-charcoal-border">
            <li>Payment will be credited to your account only after verification against our bank statement.</li>
            <li>Registration and balance fees are non-refundable.</li>
            <li>False information or fabricated screenshots will lead to permanent blacklisting.</li>
            <li>Participants must adhere to the instructions of Skyra Creations coordinators.</li>
            <li>SKYRA CREATIONS reserves the right to accept or reject any registration.</li>
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
              I confirm that the above payment details are authentic. <span className="text-lime-accent">*</span>
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:flex-1 py-4 rounded-btn font-semibold text-xs uppercase tracking-wider shadow-lime-glow flex items-center justify-center space-x-3 transition-all ${
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
                <span>Submit Balance Payment (₹{getEffectiveAmount().toLocaleString('en-IN')})</span>
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
            className="w-full sm:w-auto px-6 py-4 rounded-btn bg-charcoal-surface border border-charcoal-border hover:bg-charcoal text-charcoal-muted hover:text-ivory text-xs uppercase tracking-wider transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
