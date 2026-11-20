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
  Calendar,
  Lock,
  Wallet,
  ArrowRight,
  Sparkles
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
    setTimeout(() => setCopiedUpi(false), 3000);
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
      setUploadStatusText('Transmitting encrypted proof directly to Cloudflare R2...');

      // 1. Upload to Cloudflare R2 via presigned PUT URL
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (p) => setUploadPercent(p));

      setUploadStatusText('Recording balance installment in audit ledger...');

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
        colors: ['#D7FF74', '#FFFFFF', '#A5AAA5']
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting balance payment.');
    } finally {
      setLoading(false);
      setUploadStatusText('');
    }
  };

  // SUCCESS CONFIRMATION VIEW (Matches Haute Couture Screen 03 Style)
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-surface-container-high border border-primary/40 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(215,255,116,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary block mb-2">
            Installment Transmitted
          </span>
          <h2 className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface mb-3">
            Payment Logged for Audit
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
            Thank you, <strong className="text-on-surface font-medium">{fullName}</strong>. Your payment voucher and UTR have been transmitted to the SKYRA CREATIONS finance desk for manual bank reconciliation.
          </p>

          <div className="bg-surface-container rounded-xl p-6 max-w-md mx-auto mb-8 text-left space-y-3.5 border border-outline-variant/20">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
              <span className="font-label-caps text-label-caps uppercase text-secondary">Registration ID</span>
              <span className="font-data-mono text-base font-bold text-primary">{successResult.reg_id}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-on-surface-variant font-body-sm">Payment Reference:</span>
              <span className="text-on-surface font-data-mono text-xs">{successResult.payment_id}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-on-surface-variant font-body-sm">Amount Paid:</span>
              <span className="text-primary font-headline-sm text-headline-sm font-semibold tabular-nums">
                ₹{getEffectiveAmount().toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-on-surface-variant font-body-sm">Transaction ID / UTR:</span>
              <span className="text-on-surface font-data-mono text-xs">{transactionId}</span>
            </div>
            <div className="pt-3 flex justify-between items-center text-xs sm:text-sm border-t border-outline-variant/30">
              <span className="text-on-surface-variant font-body-sm">Audit Status:</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-label-caps uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Pending Ledger Match
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-label-md font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Pass Status</span>
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setScreenshotFile(null);
                setScreenshotPreview(null);
                setTransactionId('');
                setTermsConfirmed(false);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-all"
            >
              Record Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Portal Header Context (Screen 04) */}
      <div className="pt-2 pb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">
            Manual Audit Desk
          </span>
        </div>
        <h1 className="font-headline-lg-mobile sm:font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
          Participant Payment Portal
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-2xl">
          Settle runway registration dues via direct UPI or QR. All submissions are manually audited against institutional bank records.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-on-surface text-body-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-error">Submission Notice</p>
            <p className="text-on-surface-variant mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Account Lookup Module */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
            <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider">
              01 Candidate Ledger Lookup
            </span>
          </div>
          <span className="font-data-mono text-[11px] text-on-surface-variant">Instant Balance Check</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="e.g. SC-2026-1001 or mobile number"
              value={regIdInput}
              onChange={(e) => setRegIdInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              className="w-full bg-surface-container rounded-lg pl-10 pr-4 py-3 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:bg-surface-container-high font-data-mono text-sm border border-transparent focus:border-primary/40 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={lookupLoading || !regIdInput.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all shrink-0 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            {lookupLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Lookup Balance</span>
          </button>
        </div>

        {lookupError && (
          <div className="mt-3 p-3 bg-error-container/20 border border-error/20 rounded-lg text-xs text-error font-body-sm">
            {lookupError}
          </div>
        )}
      </div>

      {/* Financial Summary Card (Elevated Surface) - Exact Screen 04 Match */}
      {participantData && (
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md mb-space-lg shadow-md border border-outline-variant/30">
          <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-outline-variant/30">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary">Candidate ID</span>
              <div className="font-data-mono text-data-mono text-primary font-semibold tracking-wider mt-0.5">
                {participantData.reg_id}
              </div>
            </div>
            <div className="text-right">
              <span className="font-label-caps text-label-caps uppercase text-secondary">Participant</span>
              <div className="font-subheading text-subheading text-on-surface font-medium">
                {participantData.full_name}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-space-sm pt-space-xs pb-space-sm">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Total Fee</span>
              <span className="font-headline-sm text-headline-sm text-secondary">
                ₹{participantData.total_fee.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Verified Paid</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">
                ₹{participantData.amount_paid.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          {/* Balance Focus Panel */}
          <div className="mt-space-sm rounded-lg bg-surface-container-high p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_balance_wallet</span>
              <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface">Remaining Due</span>
            </div>
            <span className="font-headline-md text-headline-md text-primary font-semibold">
              ₹{participantData.balance_due.toLocaleString('en-IN')}
            </span>
          </div>

          {participantData.balance_due <= 0 && (
            <div className="mt-4 p-3.5 rounded-lg bg-primary/10 border border-primary/30 text-on-surface text-body-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Your registration fee has been 100% verified and cleared! Runway pass is unlocked.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (setLookupRegId) setLookupRegId(participantData.reg_id);
                  setActiveTab('status');
                }}
                className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md font-semibold rounded-lg uppercase tracking-wider shrink-0"
              >
                Inspect Pass
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Section (Screen 04) */}
      <div className="flex flex-col gap-space-md mb-space-lg">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">
            Direct Settlement Options
          </span>
          <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider">
            Zero Surcharge
          </span>
        </div>

        {/* QR Code Scan Card */}
        <div className="rounded-xl bg-surface-container p-space-md flex flex-col items-center text-center shadow-sm border border-outline-variant/20">
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest mb-1">
            Point &amp; Scan to Settle
          </span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">
            AURA BOUTIQUE — SKYRA
          </h3>
          
          {/* Framed QR Artwork Slot */}
          <div className="relative w-56 h-56 rounded-lg overflow-hidden bg-surface-container-highest flex items-center justify-center p-2 mb-space-md shadow-inner">
            <img
              alt="Payment QR Code for Aura Boutique SKYRA"
              className="w-full h-full object-contain rounded bg-white p-2"
              src={paymentInfo?.qr_code_url || "/qr_code.png"}
            />
          </div>

          <div className="flex items-center gap-3 text-secondary text-body-sm mb-space-xs flex-wrap justify-center font-body-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">qr_code_scanner</span> 
              Instant Scan
            </span>
            <span>•</span>
            <span>Google Pay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Paytm</span>
            <span>•</span>
            <span>BHIM UPI</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
            Open any BHIM UPI mobile application to scan and transfer precisely up to your balance due.
          </p>
        </div>

        {/* Official UPI Container */}
        <div className="rounded-xl bg-surface-container-high p-space-md flex flex-col gap-space-sm border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-secondary">
              Official Institutional UPI ID
            </span>
            <span className="inline-flex items-center gap-1 font-data-mono text-[10px] text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">verified_user</span> 
              Verified Merchant
            </span>
          </div>

          <div className="flex items-center justify-between bg-surface-container-lowest rounded-lg p-space-sm pl-space-md">
            <span className="font-data-mono text-subheading text-primary select-all tracking-wider font-semibold" id="upi-string">
              {paymentInfo?.upi_id || "mr.death4646@oksbi"}
            </span>
            <button
              onClick={copyUpiId}
              type="button"
              className="flex items-center gap-1 px-3 py-2 bg-surface-variant text-on-surface hover:text-primary rounded text-label-md font-label-md transition-all active:scale-95 focus:outline-none"
              id="copy-btn"
            >
              {copiedUpi ? (
                <>
                  <span className="material-symbols-outlined text-[18px] text-primary">check</span>
                  <span className="text-primary font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {copiedUpi && (
            <div className="flex items-center gap-2 text-primary font-body-sm text-body-sm py-1 transition-all">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>UPI ID copied to clipboard! Paste into your UPI payment app.</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span>Payee Name: <strong className="text-on-surface">{paymentInfo?.upi_name || "Sanjay Mass"}</strong></span>
            <a
              href={`upi://pay?pa=${paymentInfo?.upi_id || 'mr.death4646@oksbi'}&pn=${encodeURIComponent(paymentInfo?.upi_name || 'Sanjay Mass')}&am=${getEffectiveAmount()}&cu=INR`}
              className="text-primary hover:underline font-label-caps uppercase flex items-center gap-1"
            >
              <span>Launch UPI App</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Payment Submission Form (Screen 04) */}
      <div className="flex flex-col gap-space-md mb-space-lg">
        <div className="flex flex-col">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Submit Transaction Proof</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Record the transfer details below. Our finance desk verifies all deposits before updating credential status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {/* Identity verification fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-secondary">
                Candidate ID <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SC-2026-1001"
                value={regIdInput}
                onChange={(e) => setRegIdInput(e.target.value)}
                className="w-full bg-surface-container-high rounded-lg py-3 px-4 text-on-surface font-data-mono text-sm focus:outline-none focus:bg-surface-variant transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label-caps text-label-caps uppercase text-secondary">
                Full Registered Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Candidate full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-container-high rounded-lg py-3 px-4 text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-variant transition-colors"
              />
            </div>
          </div>

          {/* Amount Paying Now */}
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps uppercase text-secondary">
              Amount Paid (INR) <span className="text-primary">*</span>
            </label>
            
            {/* Quick selection chips */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(String(amt));
                    setCustomAmount('');
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-data-mono font-semibold transition-all text-center ${
                    selectedAmount === String(amt)
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedAmount('custom')}
                className={`py-2 px-1 rounded-lg text-xs font-label-caps uppercase font-semibold transition-all text-center ${
                  selectedAmount === 'custom'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                Other
              </button>
            </div>

            <div className="relative flex items-center mt-1">
              <span className="absolute left-3.5 font-data-mono text-on-surface-variant">₹</span>
              <input
                className="w-full bg-surface-container-high rounded-lg py-3 pl-8 pr-4 text-on-surface font-subheading text-subheading focus:outline-none focus:bg-surface-variant transition-colors"
                id="amount-paying"
                placeholder="7500"
                type="number"
                value={selectedAmount === 'custom' ? customAmount : selectedAmount}
                onChange={(e) => {
                  setSelectedAmount('custom');
                  setCustomAmount(e.target.value);
                }}
              />
            </div>
          </div>

          {/* Transaction Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps uppercase text-secondary">Transaction Date</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-on-surface-variant text-[20px]">
                calendar_today
              </span>
              <input
                className="w-full bg-surface-container-high rounded-lg py-3 pl-11 pr-4 text-on-surface font-body-md text-body-md focus:outline-none"
                readOnly
                type="text"
                value={`Today, ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              />
            </div>
          </div>

          {/* UTR / Reference ID */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-label-caps uppercase text-secondary">
                Bank UTR / Reference ID <span className="text-primary">*</span>
              </label>
              <span className="font-data-mono text-[11px] text-on-surface-variant">12 Digits</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-on-surface-variant text-[20px]">
                pin
              </span>
              <input
                required
                className="w-full bg-surface-container-high rounded-lg py-3 pl-11 pr-4 text-on-surface font-data-mono text-subheading tracking-wider focus:outline-none focus:bg-surface-variant transition-colors"
                maxLength={18}
                placeholder="e.g. 415289912048"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              Found in your payment app under 'UPI Ref No', 'UTR', or 'Transaction ID'.
            </span>
          </div>

          {/* Proof of Payment Upload Box (Screen 04) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-caps text-label-caps uppercase text-secondary">
              Screenshot Proof of Payment <span className="text-primary">*</span>
            </label>
            <label
              className="cursor-pointer flex flex-col items-center justify-center p-space-lg rounded-xl bg-surface-container hover:bg-surface-container-high transition-all text-center relative overflow-hidden group border border-outline-variant/20 hover:border-primary/40"
              htmlFor="file-upload"
            >
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="file-upload"
                onChange={handleFileChange}
                type="file"
              />
              
              {!screenshotPreview ? (
                <div className="flex flex-col items-center gap-space-xs" id="dropzone-empty">
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                  <span className="font-label-md text-label-md text-on-surface mt-1">Tap to select transaction receipt</span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">JPG, PNG, WebP up to 10MB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full" id="dropzone-preview">
                  <div className="relative w-full max-h-48 overflow-hidden rounded-lg bg-surface-container-lowest flex items-center justify-center">
                    <img
                      alt="Proof Preview"
                      className="max-h-48 w-auto object-contain rounded"
                      id="preview-img"
                      src={screenshotPreview}
                    />
                  </div>
                  <span className="font-label-caps text-label-caps uppercase text-primary mt-space-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> 
                    Screenshot Attached ({screenshotFile?.name} • Tap to change)
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-space-sm pt-space-xs">
            <div className="flex items-center h-6">
              <input
                required
                className="w-5 h-5 rounded bg-surface-container-high text-primary focus:ring-0 focus:outline-none accent-primary cursor-pointer"
                id="audit-confirm"
                type="checkbox"
                checked={termsConfirmed}
                onChange={(e) => setTermsConfirmed(e.target.checked)}
              />
            </div>
            <label
              className="font-body-sm text-body-sm text-on-surface leading-tight cursor-pointer select-none"
              htmlFor="audit-confirm"
            >
              I confirm that this UTR and payment screenshot correspond to an actual debit from my personal or authorized bank account.
            </label>
          </div>

          {/* Prominent Operational Info Note */}
          <div className="rounded-xl bg-surface-container-low p-space-md flex gap-space-sm items-start border border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">lock_clock</span>
            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Institutional Verification Notice</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Your payment will be marked as <span className="text-primary font-medium">Confirmed</span> only after manual ledger reconciliation against the official SKYRA CREATIONS bank statement. Please allow up to 24 business hours for runway accreditation pass generation.
              </p>
            </div>
          </div>

          {/* Primary Action CTA */}
          <div className="pt-space-sm flex flex-col sm:flex-row gap-3">
            <button
              disabled={loading}
              className={`flex-1 h-12 bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-label-md font-semibold tracking-wider uppercase rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md focus:outline-none ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              id="submit-audit-btn"
              type="submit"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>{uploadStatusText} ({uploadPercent}%)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send_and_archive</span>
                  <span>Submit Payment Proof for Verification (₹{getEffectiveAmount().toLocaleString('en-IN')})</span>
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
              className="px-6 h-12 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
