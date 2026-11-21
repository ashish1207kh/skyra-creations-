import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Check, 
  Copy, 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  ExternalLink, 
  AlertCircle,
  Building2,
  Phone,
  Sparkles,
  X
} from 'lucide-react';
import { PaymentInfo } from '../types/index';

export interface DynamicUpiPaymentProps {
  amount: number;
  paymentInfo?: PaymentInfo | null;
  registrationId?: string;
  paymentType?: 'INITIAL_REGISTRATION' | 'BALANCE_PAYMENT';
  onTransactionReferenceGenerated?: (ref: string) => void;
  showModalTrigger?: boolean;
}

export default function DynamicUpiPayment({
  amount,
  paymentInfo,
  registrationId,
  paymentType = 'INITIAL_REGISTRATION',
  onTransactionReferenceGenerated,
  showModalTrigger = true,
}: DynamicUpiPaymentProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [appOpenNotice, setAppOpenNotice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recipient details from server/owner configuration
  const upiId = paymentInfo?.upi_id || 'sri.469512-1@oksbi';
  const upiName = paymentInfo?.upi_name || 'B Sriram';
  const bankName = paymentInfo?.bank_name || 'Indian Bank';
  const bankAccountRef = paymentInfo?.bank_account_ref || '5056';
  const associatedMobile = paymentInfo?.associated_mobile || '9342049287';
  const aid = paymentInfo?.aid || 'uGICAgLCoysb4Rw';

  // Generate unique payment transaction reference (tr) for this session
  const paymentReference = useMemo(() => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const prefix = registrationId ? registrationId.replace(/[^A-Z0-9]/gi, '') : 'SKYRA';
    const ref = `SC-${prefix.slice(-4)}-${timestamp}${random}`;
    if (onTransactionReferenceGenerated) {
      onTransactionReferenceGenerated(ref);
    }
    return ref;
  }, [registrationId, amount, paymentType]);

  const paymentDescription = useMemo(() => {
    const tag = paymentType === 'BALANCE_PAYMENT' ? 'Balance Fee' : 'Token Advance';
    const reg = registrationId ? ` - ${registrationId}` : '';
    return `SKYRA CREATIONS ${tag}${reg}`;
  }, [paymentType, registrationId]);

  // Dynamic standards-compliant UPI payment URI (NPCI standard)
  const upiUri = useMemo(() => {
    const formattedAmount = Number(amount || 0).toFixed(2);
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      am: formattedAmount,
      cu: 'INR',
      tn: paymentDescription,
      tr: paymentReference,
      aid: aid,
    });
    return `upi://pay?${params.toString()}`;
  }, [upiId, upiName, amount, paymentDescription, paymentReference, aid]);

  // Deep-link intent handlers for specific apps
  const handleLaunchUpi = (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other') => {
    let deepLink = upiUri;
    let appLabel = 'UPI App';

    if (app === 'gpay') {
      appLabel = 'Google Pay';
      // Android intent for Tez/GPay or fallback generic
      deepLink = upiUri.replace('upi://pay', 'tez://upi/pay');
    } else if (app === 'phonepe') {
      appLabel = 'PhonePe';
      deepLink = upiUri.replace('upi://pay', 'phonepe://pay');
    } else if (app === 'paytm') {
      appLabel = 'Paytm';
      deepLink = upiUri.replace('upi://pay', 'paytmmp://pay');
    } else if (app === 'bhim') {
      appLabel = 'BHIM';
      deepLink = upiUri.replace('upi://pay', 'bhim://pay');
    } else {
      appLabel = 'UPI App';
      deepLink = upiUri;
    }

    setAppOpenNotice(`Launching ${appLabel} with exact amount ₹${amount.toLocaleString('en-IN')}. If the app does not launch automatically on your device, please scan the dynamic QR code below.`);

    // Try navigating to deep link
    window.location.href = deepLink;

    // Clear notice after 8 seconds
    setTimeout(() => {
      setAppOpenNotice(null);
    }, 8000);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(paymentReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const paymentButtons = (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>Instant UPI App Checkout</span>
        <span className="text-[10px] text-amber-400 lowercase font-mono">one-tap pay</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* 1. Google Pay */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('gpay')}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-blue-400 text-white text-xs font-medium transition-all group shadow-sm active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-blue-600">G</span>
          <span>Google Pay</span>
        </button>

        {/* 2. PhonePe */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('phonepe')}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-purple-400 text-white text-xs font-medium transition-all group shadow-sm active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">पे</span>
          <span>PhonePe</span>
        </button>

        {/* 3. Paytm */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('paytm')}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-400 text-white text-xs font-medium transition-all group shadow-sm active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">P</span>
          <span>Paytm</span>
        </button>

        {/* 4. BHIM */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('bhim')}
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-400 text-white text-xs font-medium transition-all group shadow-sm active:scale-95"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">B</span>
          <span>BHIM UPI</span>
        </button>

        {/* 5. Other UPI Apps */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('other')}
          className="col-span-2 sm:col-span-2 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Pay with Other UPI Apps (Cred, Bank App)</span>
        </button>
      </div>

      {appOpenNotice && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-start space-x-2 mt-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{appOpenNotice}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#0a0c12] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Official Verified Payee Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Official SKYRA Recipient</span>
            </span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-zinc-400 text-xs font-medium">B Sriram (Indian Bank 5056)</span>
          </div>
          <h4 className="text-white text-lg font-bold font-serif mt-1">
            Dynamic UPI Payment Portal
          </h4>
          <p className="text-xs text-zinc-400">
            Secure, server-controlled payment with instant pre-filled exact amount.
          </p>
        </div>

        {showModalTrigger && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors shrink-0 self-start sm:self-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Dedicated Payment Popup</span>
          </button>
        )}
      </div>

      {/* Main Grid: Details + Dynamic QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: Official Recipient & Action Details */}
        <div className="space-y-4">
          {/* Recipient Details Card */}
          <div className="bg-[#12151e] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">
                Official Payee Name
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <strong className="text-white text-base font-serif">{upiName}</strong>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Verified Account
                </span>
              </div>
              <span className="text-xs text-zinc-400 block mt-0.5">
                Founder & CEO, Skyra Creations
              </span>
            </div>

            {/* Bank Reference & Mobile */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{bankName} (Acct Ref: {bankAccountRef})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>+91 {associatedMobile}</span>
              </div>
            </div>

            {/* UPI ID / VPA with Copy Button */}
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                UPI ID / VPA
              </span>
              <div className="flex items-center space-x-2">
                <code className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-amber-300 font-mono text-xs sm:text-sm font-bold flex-1 select-all">
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Payment Transaction Reference */}
            <div>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                Payment Reference ID
              </span>
              <div className="flex items-center space-x-2">
                <code className="bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-zinc-300 font-mono text-xs flex-1 select-all">
                  {paymentReference}
                </code>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold inline-flex items-center space-x-1 transition-colors"
                  title="Copy Reference ID"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Exact Payable Amount */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-baseline justify-between">
              <span className="text-xs text-zinc-400">Exact Payable Amount:</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Fresh Dynamic QR Code */}
        <div className="flex flex-col items-center justify-center bg-[#12151e] border border-zinc-800 rounded-2xl p-5 text-center shadow-inner">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <QrCode className="w-4 h-4" />
            <span>Dynamic Payment QR (₹{amount.toLocaleString('en-IN')})</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-3">
            Pre-configured with recipient <strong className="text-white">{upiName}</strong> and exact amount.
          </p>

          {/* Dynamic QR Code Render */}
          <div className="bg-white p-3.5 rounded-2xl shadow-2xl border-4 border-amber-400/20">
            <QRCodeSVG
              value={upiUri}
              size={180}
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
          </div>

          <div className="mt-3 text-[11px] text-zinc-400 font-medium space-y-0.5">
            <span className="block text-white font-semibold">Scan with any UPI application</span>
            <span className="text-zinc-500 block">Google Pay • PhonePe • Paytm • BHIM • Cred • Banking Apps</span>
          </div>
        </div>
      </div>

      {/* 5 UPI Payment Buttons */}
      <div className="pt-4 border-t border-zinc-800">
        {paymentButtons}
      </div>

      {/* Security & Anti-Fraud Notice */}
      <div className="bg-[#12151e]/60 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-400 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-zinc-300 font-semibold block">Official Verification Policy & Security Notice:</span>
          <p className="text-[11px] leading-relaxed">
            Never share your UPI PIN or banking passwords with anyone. Skyra Creations verifies all transactions manually against bank records. After completing payment in your UPI app, please enter your <strong>12-digit UPI Transaction ID (UTR)</strong> and upload the <strong>payment screenshot</strong> below.
          </p>
        </div>
      </div>

      {/* Dedicated Payment Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#12151e] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors"
              title="Close Popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SKYRA CREATIONS UPI PORTAL</span>
              </span>
              <h3 className="text-2xl font-bold font-serif text-white mt-2">
                Complete Your Payment
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Payable to <strong className="text-white">{upiName}</strong> ({bankName} • 5056)
              </p>
              <div className="mt-3 text-3xl font-black text-amber-400 font-mono">
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Dynamic QR in Modal */}
            <div className="bg-white p-4 rounded-2xl shadow-xl w-fit mx-auto mb-6 border-4 border-amber-400/20">
              <QRCodeSVG
                value={upiUri}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* UPI Buttons in Modal */}
            <div className="mb-6">
              {paymentButtons}
            </div>

            {/* Reference & Copy in Modal */}
            <div className="bg-[#0a0c12] border border-zinc-800 rounded-2xl p-4 text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Recipient UPI ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-amber-300 font-bold">{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Payment Reference:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-zinc-300">{paymentReference}</span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Next Step Guidance */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-sm transition-all shadow-lg active:scale-98"
              >
                I have completed the payment → Enter UTR
              </button>
              <p className="text-[11px] text-zinc-500 mt-2">
                Clicking will return you to the verification form to enter your 12-digit UTR number.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
