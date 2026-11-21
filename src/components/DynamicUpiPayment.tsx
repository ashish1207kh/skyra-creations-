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
import { motion, AnimatePresence } from 'motion/react';
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

  // Recipient details from server/owner configuration (STRICTLY PRESERVED)
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

    setAppOpenNotice(`Initiating ${appLabel} with exact amount ₹${amount.toLocaleString('en-IN')}. If the app does not launch automatically on your device, please scan the dynamic QR code.`);

    window.location.href = deepLink;

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
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono-editorial text-[10px] tracking-widest text-[#BFC3C7]">
        <span>INSTANT 1-TAP CHECKOUT</span>
        <span className="text-[#C6FF00]">NPCI UPI INTENT</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* 1. Google Pay */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('gpay')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-white/30 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-blue-600">G</span>
          <span className="font-mono-editorial text-[11px]">Google Pay</span>
        </button>

        {/* 2. PhonePe */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('phonepe')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-purple-500/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">पे</span>
          <span className="font-mono-editorial text-[11px]">PhonePe</span>
        </button>

        {/* 3. Paytm */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('paytm')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-cyan-400/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">P</span>
          <span className="font-mono-editorial text-[11px]">Paytm</span>
        </button>

        {/* 4. BHIM */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('bhim')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-emerald-400/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">B</span>
          <span className="font-mono-editorial text-[11px]">BHIM UPI</span>
        </button>

        {/* 5. Other UPI Apps */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('other')}
          className="col-span-2 sm:col-span-2 flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#C6FF00]/10 hover:bg-[#C6FF00]/15 border border-[#C6FF00]/40 text-[#C6FF00] text-xs font-semibold transition-all active:scale-98"
        >
          <Smartphone className="w-4 h-4 text-[#C6FF00]" />
          <span className="font-mono-editorial text-[11px] tracking-wide">Cred / Any Bank UPI App</span>
        </button>
      </div>

      {appOpenNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-sm text-xs text-blue-300 flex items-start space-x-2.5 mt-2"
        >
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{appOpenNotice}</span>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="bg-[#0b0c10] border border-white/10 rounded-sm p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Official Verified Payee Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-mono-editorial text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-[#C6FF00]" />
              <span>OFFICIAL SKYRA RECIPIENT</span>
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-[#BFC3C7] text-xs font-mono-editorial">B Sriram (Indian Bank 5056)</span>
          </div>
          <h4 className="text-white text-xl font-bold font-editorial mt-1.5 tracking-tight">
            Dynamic UPI Payment Gateway
          </h4>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            Encrypted, server-controlled NPCI payment with pre-filled exact token amount.
          </p>
        </div>

        {showModalTrigger && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-sm bg-white/5 hover:bg-white/10 text-[#C6FF00] border border-[#C6FF00]/40 font-mono-editorial text-xs font-semibold inline-flex items-center space-x-2 transition-all shrink-0 self-start sm:self-auto hover:border-[#C6FF00]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>EXPAND PAYMENT QR</span>
          </button>
        )}
      </div>

      {/* Main Grid: Details + Dynamic QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: Official Recipient & Action Details */}
        <div className="space-y-4">
          {/* Recipient Details Card */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-5 space-y-3.5">
            <div>
              <span className="font-mono-editorial text-[10px] text-[#BFC3C7] uppercase tracking-widest block font-medium">
                OFFICIAL BENEFICIARY NAME
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <strong className="text-white text-lg font-editorial tracking-wide">{upiName}</strong>
                <span className="px-2 py-0.5 rounded-sm text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono-editorial uppercase">
                  Verified
                </span>
              </div>
              <span className="text-xs text-zinc-400 block mt-0.5 font-light">
                Founder &amp; CEO, SKYRA CREATIONS
              </span>
            </div>

            {/* Bank Reference & Mobile */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <Building2 className="w-3.5 h-3.5 text-[#C6FF00] shrink-0" />
                <span className="font-mono-editorial text-[11px]">{bankName} ({bankAccountRef})</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-[#C6FF00] shrink-0" />
                <span className="font-mono-editorial text-[11px]">+91 {associatedMobile}</span>
              </div>
            </div>

            {/* UPI ID / VPA with Copy Button */}
            <div className="pt-3 border-t border-white/10">
              <span className="font-mono-editorial text-[10px] text-[#BFC3C7] uppercase tracking-widest block font-medium mb-1.5">
                BENEFICIARY UPI ID / VPA
              </span>
              <div className="flex items-center space-x-2">
                <code className="bg-[#080808] border border-white/15 rounded-sm px-3.5 py-2 text-[#C6FF00] font-mono text-xs sm:text-sm font-bold flex-1 select-all tracking-wide">
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3.5 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white font-mono-editorial text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors border border-white/15"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Payment Transaction Reference */}
            <div>
              <span className="font-mono-editorial text-[10px] text-[#BFC3C7] uppercase tracking-widest block font-medium mb-1.5">
                SESSION TRANSACTION REF
              </span>
              <div className="flex items-center space-x-2">
                <code className="bg-[#080808] border border-white/15 rounded-sm px-3.5 py-2 text-zinc-300 font-mono text-xs flex-1 select-all tracking-wider">
                  {paymentReference}
                </code>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="px-3.5 py-2 rounded-sm bg-white/10 hover:bg-white/20 text-white font-mono-editorial text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors border border-white/15"
                  title="Copy Reference ID"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedRef ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Exact Payable Amount */}
            <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
              <span className="font-mono-editorial text-xs text-[#BFC3C7]">EXACT PAYABLE AMOUNT:</span>
              <span className="text-2xl sm:text-3xl font-black text-[#C6FF00] font-mono tracking-tight">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Fresh Dynamic QR Code */}
        <div className="flex flex-col items-center justify-center bg-[#12141a] border border-white/10 rounded-sm p-6 text-center shadow-inner">
          <div className="font-mono-editorial text-[11px] font-bold text-[#C6FF00] uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <QrCode className="w-4 h-4" />
            <span>DYNAMIC QR (₹{amount.toLocaleString('en-IN')})</span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-4 font-light">
            Pre-configured with payee <strong className="text-white font-medium">{upiName}</strong> and exact amount.
          </p>

          {/* Dynamic QR Code Render */}
          <div className="bg-white p-4 rounded-sm shadow-2xl border-2 border-white/20">
            <QRCodeSVG
              value={upiUri}
              size={180}
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
          </div>

          <div className="mt-4 text-[11px] text-zinc-400 space-y-1">
            <span className="block text-white font-mono-editorial text-xs font-semibold">SCAN WITH ANY UPI APP</span>
            <span className="text-zinc-500 font-mono-editorial text-[10px] block">Google Pay • PhonePe • Paytm • BHIM • Cred • Banking Apps</span>
          </div>
        </div>
      </div>

      {/* 5 UPI Payment Buttons */}
      <div className="pt-4 border-t border-white/10">
        {paymentButtons}
      </div>

      {/* Security & Anti-Fraud Notice */}
      <div className="bg-[#12141a]/60 border border-white/10 rounded-sm p-4 text-xs text-zinc-400 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 font-light leading-relaxed">
          <span className="text-white font-mono-editorial text-[11px] tracking-wider uppercase block font-semibold">
            Official Security &amp; Settlement Notice:
          </span>
          <p className="text-[11px] text-zinc-400">
            Never share your UPI PIN with anyone. SKYRA CREATIONS verifies all payments directly against bank statement settlement logs. After completing payment in your UPI app, enter your <strong className="text-white font-medium">12-digit UPI Transaction ID (UTR)</strong> and upload the <strong className="text-white font-medium">payment screenshot</strong> below.
          </p>
        </div>
      </div>

      {/* Dedicated Payment Modal / Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12141a] border border-white/15 rounded-sm max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors"
                title="Close Popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <span className="px-3 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-mono-editorial text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SKYRA CREATIONS SECURE PORTAL</span>
                </span>
                <h3 className="text-2xl font-bold font-editorial text-white mt-2.5">
                  Complete Your Payment
                </h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Payable to <strong className="text-white">{upiName}</strong> ({bankName} • 5056)
                </p>
                <div className="mt-3 text-3xl font-black text-[#C6FF00] font-mono">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Dynamic QR in Modal */}
              <div className="bg-white p-4 rounded-sm shadow-xl w-fit mx-auto mb-6 border-2 border-white/20">
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
              <div className="bg-[#080808] border border-white/10 rounded-sm p-4 text-xs space-y-2.5 mb-5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#BFC3C7]">Recipient UPI:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#C6FF00] font-bold">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded-sm bg-white/10 text-white hover:bg-white/20"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#BFC3C7]">Reference ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-zinc-300">{paymentReference}</span>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="p-1 rounded-sm bg-white/10 text-white hover:bg-white/20"
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
                  className="w-full py-3.5 bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-mono-editorial font-bold text-xs uppercase tracking-wider rounded-sm transition-all shadow-lg active:scale-98"
                >
                  I HAVE COMPLETED PAYMENT → PROCEED
                </button>
                <p className="text-[11px] text-zinc-500 font-light mt-2">
                  Clicking closes popup so you can enter the 12-digit UTR and attach your screenshot.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
