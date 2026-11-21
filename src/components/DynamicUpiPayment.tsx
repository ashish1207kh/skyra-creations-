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
  Phone,
  Sparkles,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentInfo } from '../types/index';

// High-fidelity official payment app brand SVG icons
const GooglePayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M23.49 12.27c0-.85-.07-1.68-.21-2.47H12v4.67h6.44a5.51 5.51 0 0 1-2.39 3.62v3.01h3.87c2.26-2.09 3.57-5.16 3.57-8.83z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3.01c-1.08.72-2.45 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.97H1.25v3.1A11.99 11.99 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.25 14.26a7.19 7.19 0 0 1 0-4.52V6.64H1.25a11.99 11.99 0 0 0 0 10.72l4-3.1z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.95 1.18 15.23 0 12 0 7.39 0 3.44 2.64 1.25 6.64l4 3.1c.95-2.85 3.61-4.97 6.75-4.97z"
      fill="#EA4335"
    />
  </svg>
);

const PhonePeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="18" fill="#5F259F" />
    <path
      d="M24.2 13.5c-.3-.8-.9-1.3-1.8-1.6-.8-.3-1.8-.4-3.1-.4h-4.1v13h2.6v-4.2h1.6c1.3 0 2.3-.2 3.1-.7.8-.5 1.4-1.2 1.6-2.1.2-1 .2-1.7 0-2.4-.1-.7-.4-1.2-.9-1.6zm-2.7 2.7c-.2.4-.5.7-.8.8-.4.2-1 .2-1.7.2h-1.4v-3.1h1.4c.7 0 1.3.1 1.6.3.4.2.7.5.8.8.2.3.2.7.1 1z"
      fill="#FFFFFF"
    />
    <path
      d="M19.5 6.4l-7.7 10.8h3.6v9.2h2.6v-9.2h3.8l-2.3-10.8z"
      fill="#FFFFFF"
      fillOpacity="0.15"
    />
    <path
      d="M13.8 22.7h2.7v-5.5h-2.7v5.5zm5.8-15.7l-6.4 8.9h3.3v2.2h2.7v-2.2h2.6l-2.2-8.9z"
      fill="#FFFFFF"
    />
  </svg>
);

const PaytmIcon = ({ className = "h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 68 22" fill="none">
    <rect width="68" height="22" rx="4" fill="#002E6E" />
    <text
      x="6"
      y="15.5"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="13"
      fontWeight="900"
      fill="#FFFFFF"
      letterSpacing="-0.6px"
    >
      Pay
    </text>
    <text
      x="33"
      y="15.5"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="13"
      fontWeight="900"
      fill="#00BAF2"
      letterSpacing="-0.6px"
    >
      tm
    </text>
  </svg>
);

const BhimIcon = ({ className = "h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 22" fill="none">
    <rect width="64" height="22" rx="4" fill="#0A3A60" />
    <path d="M7 4h3.5l4 14h-3.5L7 4z" fill="#00A859" />
    <path d="M13.5 4H17l4 14h-3.5l-4-14z" fill="#F47920" />
    <text
      x="25"
      y="15.5"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="11"
      fontWeight="900"
      fill="#FFFFFF"
      letterSpacing="0.6px"
    >
      BHIM
    </text>
  </svg>
);

const UpiBrandIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="6" fill="#1A1C24" stroke="rgba(255,255,255,0.15)" />
    <path d="M19 8l6 8-6 8h-4.5l6-8-6-8H19z" fill="#00A859" />
    <path d="M12.5 8l6 8-6 8H8l6-8-6-8h4.5z" fill="#F47920" />
  </svg>
);

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
          <GooglePayIcon className="w-5 h-5 shrink-0" />
          <span className="font-mono-editorial text-[11px] font-bold">Google Pay</span>
        </button>

        {/* 2. PhonePe */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('phonepe')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-purple-500/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <PhonePeIcon className="w-5 h-5 shrink-0" />
          <span className="font-mono-editorial text-[11px] font-bold">PhonePe</span>
        </button>

        {/* 3. Paytm */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('paytm')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-cyan-400/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <PaytmIcon className="h-4 shrink-0" />
          <span className="font-mono-editorial text-[11px] font-bold">Paytm</span>
        </button>

        {/* 4. BHIM */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('bhim')}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-sm bg-[#12141a] hover:bg-[#1a1c24] border border-white/10 hover:border-emerald-400/40 text-white text-xs font-medium transition-all group active:scale-98 shadow-sm"
        >
          <BhimIcon className="h-4 shrink-0" />
          <span className="font-mono-editorial text-[11px] font-bold">BHIM UPI</span>
        </button>

        {/* 5. Other UPI Apps */}
        <button
          type="button"
          onClick={() => handleLaunchUpi('other')}
          className="col-span-2 sm:col-span-2 flex items-center justify-center space-x-2.5 py-3 px-3 rounded-sm bg-[#C6FF00]/10 hover:bg-[#C6FF00]/15 border border-[#C6FF00]/40 text-[#C6FF00] text-xs font-semibold transition-all active:scale-98"
        >
          <UpiBrandIcon className="w-5 h-5 shrink-0" />
          <span className="font-mono-editorial text-[11px] tracking-wide font-bold">Cred / Any Bank UPI</span>
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
    <div className="bg-[#0b0c10] border border-white/10 rounded-sm p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5">
      {/* Official Verified Payee Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-3.5 sm:pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-mono-editorial text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3 h-3 text-[#C6FF00]" />
              <span>OFFICIAL SKYRA RECIPIENT</span>
            </span>
            <span className="text-white/30 text-xs">•</span>
            <span className="text-[#BFC3C7] text-xs font-mono-editorial">B Sriram</span>
          </div>
          <h4 className="text-white text-lg sm:text-xl font-bold font-editorial mt-1 tracking-tight">
            Dynamic UPI Payment Gateway
          </h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-0.5">
            Encrypted, server-controlled NPCI payment with pre-filled exact token amount.
          </p>
        </div>

        {showModalTrigger && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-[#C6FF00] border border-[#C6FF00]/40 font-mono-editorial text-xs font-semibold inline-flex items-center space-x-2 transition-all shrink-0 self-start sm:self-auto hover:border-[#C6FF00]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>EXPAND PAYMENT QR</span>
          </button>
        )}
      </div>

      {/* Main Grid: Details + Dynamic QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
        {/* Left Column: Official Recipient & Action Details */}
        <div className="space-y-3 sm:space-y-4">
          {/* Recipient Details Card */}
          <div className="bg-[#12141a] border border-white/10 rounded-sm p-4 sm:p-5 space-y-3">
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

            {/* Associated Mobile Helpline */}
            <div className="pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-[#C6FF00] shrink-0" />
                <span className="font-mono-editorial text-[11px]">Associated Mobile: +91 {associatedMobile}</span>
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#12141a] border border-white/15 rounded-sm max-w-lg w-full p-4 sm:p-8 shadow-2xl relative max-h-[88vh] overflow-y-auto my-auto"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors"
                title="Close Popup"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-4 sm:mb-6 pr-8 sm:pr-0">
                <span className="px-3 py-1 rounded-sm bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/30 font-mono-editorial text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SKYRA CREATIONS SECURE PORTAL</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-editorial text-white mt-2">
                  Complete Your Payment
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-1">
                  Payable to <strong className="text-white">{upiName}</strong>
                </p>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-[#C6FF00] font-mono">
                  ₹{amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Dynamic QR in Modal */}
              <div className="bg-white p-3 sm:p-4 rounded-sm shadow-xl w-fit mx-auto mb-4 sm:mb-6 border-2 border-white/20">
                <QRCodeSVG
                  value={upiUri}
                  size={165}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* UPI Buttons in Modal */}
              <div className="mb-6">
                {paymentButtons}
              </div>

              {/* UPI & Amount in Modal */}
              <div className="bg-[#080808] border border-white/10 rounded-sm p-4 text-xs space-y-2.5 mb-5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-[#BFC3C7]">Recipient UPI:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#C6FF00] font-bold">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 rounded-sm bg-white/10 text-white hover:bg-white/20"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-[#BFC3C7]">Beneficiary:</span>
                  <span className="text-white font-bold">{upiName}</span>
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
