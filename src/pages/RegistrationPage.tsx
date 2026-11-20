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
  Eye
} from 'lucide-react';
import { getPaymentInfo, registerContestant } from '../lib/api';
import { uploadFileToR2 } from '../lib/storage';
import { PaymentInfo } from '../types/index';

interface RegistrationPageProps {
  setActiveTab: (tab: string) => void;
  setLookupRegId?: (id: string) => void;
}

export default function RegistrationPage({ setActiveTab, setLookupRegId }: RegistrationPageProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState<{ reg_id: string; message: string } | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [genderOther, setGenderOther] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('Runway Model');
  const [height, setHeight] = useState('');
  const [instagram, setInstagram] = useState('');
  const [experience, setExperience] = useState('');

  // Payment
  const [paymentOption, setPaymentOption] = useState<'advance_2000' | 'advance_1500' | 'full'>('advance_2000');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  useEffect(() => {
    getPaymentInfo()
      .then(data => setPaymentInfo(data))
      .catch(err => console.error("Error loading payment info", err));
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Screenshot file size exceeds 10 MB limit.');
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

  const getEffectiveAmount = () => {
    if (paymentOption === 'full') return 5000;
    if (paymentOption === 'advance_1500') return 1500;
    return 2000;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsConfirmed) {
      setErrorMsg('Please confirm the terms and conditions checkbox to submit.');
      return;
    }
    if (!screenshotFile) {
      setErrorMsg('Please upload your payment screenshot proof.');
      return;
    }
    if (!transactionId.trim()) {
      setErrorMsg('Please enter your Transaction ID / UTR ID.');
      return;
    }

    const finalGender = gender === 'Other' ? (genderOther || 'Other') : gender;
    const finalAmount = getEffectiveAmount();

    try {
      setLoading(true);
      setUploadPercent(0);
      setUploadStatusText('Uploading payment proof to Cloudflare R2...');

      // 1. Direct browser-to-Cloudflare R2 presigned upload
      const objectKey = await uploadFileToR2(screenshotFile, 'proofs', (percent) => {
        setUploadPercent(percent);
      });

      setUploadStatusText('Recording registration in Supabase PostgreSQL...');

      // 2. Submit record to Vercel Serverless Function
      const res = await registerContestant({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        dob: dob.trim(),
        gender: finalGender.trim(),
        mobile: mobile.trim(),
        whatsapp: sameAsMobile ? mobile.trim() : whatsapp.trim(),
        city: city.trim(),
        category,
        height: height.trim() || null,
        instagram: instagram.trim() || null,
        experience: experience.trim() || null,
        amount: finalAmount,
        transaction_id: transactionId.trim(),
        r2_object_key: objectKey,
        terms_confirmed: true,
      });

      setSuccessResult({
        reg_id: res.reg_id,
        message: res.message,
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your registration.');
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

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
            Registration Submitted!
          </h2>
          <p className="text-zinc-300 max-w-xl mx-auto mb-6">
            Welcome to the Skyra Creations Runway Show. Your registration details and payment screenshot have been safely recorded.
          </p>

          <div className="bg-[#0b0d13]/80 border border-zinc-800 rounded-xl p-6 max-w-md mx-auto mb-8 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <span className="text-xs uppercase tracking-wider text-zinc-400">Official Registration ID</span>
              <span className="font-mono text-lg font-bold text-amber-400">{successResult.reg_id}</span>
            </div>
            <div className="py-2 flex justify-between text-sm">
              <span className="text-zinc-400">Participant Name:</span>
              <span className="text-white font-medium">{fullName}</span>
            </div>
            <div className="py-2 flex justify-between text-sm">
              <span className="text-zinc-400">Selected Amount:</span>
              <span className="text-white font-medium">₹{getEffectiveAmount()}</span>
            </div>
            <div className="py-2 flex justify-between text-sm">
              <span className="text-zinc-400">Transaction ID / UTR:</span>
              <span className="text-zinc-300 font-mono text-xs">{transactionId}</span>
            </div>
            <div className="pt-2 flex justify-between items-center text-sm border-t border-zinc-800">
              <span className="text-zinc-400">Payment Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Pending Verification
              </span>
            </div>
          </div>

          <div className="bg-amber-950/20 border border-amber-600/30 rounded-xl p-4 text-xs text-amber-200/90 max-w-md mx-auto mb-8">
            <p className="font-semibold mb-1">What Happens Next?</p>
            <p>Our team will contact you through WhatsApp after verification. Please save your Registration ID ({successResult.reg_id}).</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (setLookupRegId) setLookupRegId(successResult.reg_id);
                setActiveTab('status');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View My Registration & Pass</span>
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
              Register Another Contestant
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
              <Sparkles className="w-4 h-4" />
              <span>Official Event Registration Form</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
              SKYRA CREATIONS — RUNWAY SHOW REGISTRATION
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

        <div className="space-y-2 text-sm text-zinc-300 border-l-2 border-amber-500/50 pl-4 py-1">
          <p className="font-medium text-amber-200">Welcome to skyra creations</p>
          <p>Please fill in all the required details carefully.</p>
          <p className="text-zinc-400">
            After registration there is no refund for any circumstances, complete your payment and upload the payment screenshot.
          </p>
          <p className="text-amber-400 font-medium pt-1">
            Our Team will contact you through WhatsApp after verification.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Notice</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Details */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">1</div>
            <div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <p className="text-xs text-zinc-400">Used for verification and participation certificates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Enter Your Full Name <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">Please avoid nicknames. This name will be used for verification and your participation certificate.</p>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjay Verma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Date of Birth <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Gender <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Female', 'Male', 'Other'].map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer text-sm font-medium transition-all ${
                      gender === g
                        ? 'border-amber-500/80 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={(e) => setGender(e.target.value)}
                      className="sr-only"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
              {gender === 'Other' && (
                <input
                  type="text"
                  placeholder="Please specify gender"
                  value={genderOther}
                  onChange={(e) => setGenderOther(e.target.value)}
                  className="mt-3 w-full bg-[#0a0c12] border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Mobile Number <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-1.5">Enter a valid mobile number that is active and reachable</p>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-zinc-200">
                  WhatsApp Number <span className="text-amber-400">*</span>
                </label>
                <label className="flex items-center space-x-1.5 text-xs text-amber-400/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={handleSameAsMobileToggle}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span>Same as Mobile</span>
                </label>
              </div>
              <p className="text-xs text-zinc-400 mb-1.5">Our team communicates event schedules via WhatsApp</p>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-500" />
                <input
                  type="tel"
                  required
                  disabled={sameAsMobile}
                  placeholder="+91 98765 43210"
                  value={sameAsMobile ? mobile : whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm ${
                    sameAsMobile ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                City <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">Please enter your current city</p>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai, Bangalore, Hyderabad..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Runway Profile */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
            <div>
              <h2 className="text-lg font-bold text-white">Runway Show Profile & Category</h2>
              <p className="text-xs text-zinc-400">Contestant categorization and portfolio details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Contestant Category <span className="text-amber-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 text-sm"
              >
                <option value="Runway Model">Runway Model (Adults / Open)</option>
                <option value="Teen / Fresher Runway">Teen / Fresher Runway</option>
                <option value="Kids Runway">Kids Runway Category</option>
                <option value="Designer Collection Showcase">Designer Collection Showcase</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Height (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 5ft 9in or 175 cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Instagram / Portfolio Handle
              </label>
              <input
                type="text"
                placeholder="@username or portfolio link"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Prior Experience
              </label>
              <input
                type="text"
                placeholder="e.g. College pageants, photo shoots, fresher..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Scan & Pay Google Pay QR Code */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-zinc-800/80">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
            <div>
              <h2 className="text-lg font-bold text-white">Payment & Proof Submission</h2>
              <p className="text-xs text-zinc-400">Total Standard Event Fee: ₹5,000</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-200 mb-3">
              Choose Payment Option <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentOption === 'advance_2000'
                    ? 'border-amber-500 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'advance_2000'}
                  onChange={() => setPaymentOption('advance_2000')}
                  className="sr-only"
                />
                <div className="text-xs text-amber-400 font-semibold mb-1">MOST POPULAR</div>
                <div className="text-lg font-bold">₹2,000 Advance</div>
                <div className="text-xs text-zinc-400 mt-1">Remaining ₹3,000 via Balance Form</div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentOption === 'advance_1500'
                    ? 'border-amber-500 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'advance_1500'}
                  onChange={() => setPaymentOption('advance_1500')}
                  className="sr-only"
                />
                <div className="text-xs text-zinc-400 font-semibold mb-1">STANDARD ADVANCE</div>
                <div className="text-lg font-bold">₹1,500 Advance</div>
                <div className="text-xs text-zinc-400 mt-1">Remaining ₹3,500 via Balance Form</div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentOption === 'full'
                    ? 'border-amber-500 bg-amber-500/15 text-white'
                    : 'border-zinc-800 bg-[#0a0c12] text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="payOpt"
                  checked={paymentOption === 'full'}
                  onChange={() => setPaymentOption('full')}
                  className="sr-only"
                />
                <div className="text-xs text-emerald-400 font-semibold mb-1">FULL PAYMENT</div>
                <div className="text-lg font-bold">₹5,000 Full Fee</div>
                <div className="text-xs text-zinc-400 mt-1">Instant complete clearance</div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0a0c12] border border-zinc-800/80 rounded-2xl p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">Scan and Pay</span>
              <div className="w-56 h-56 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                <img
                  src={paymentInfo?.qr_code_url || "/qr_code.png"}
                  alt="Skyra Creations Google Pay QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-3 text-xs text-zinc-400">
                <span>Google Pay • PhonePe • Paytm • BHIM UPI</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#12151e] p-4 rounded-xl border border-zinc-800">
                <div className="text-xs text-zinc-400">Official UPI ID:</div>
                <div className="font-mono text-base font-bold text-amber-400 select-all">
                  {paymentInfo?.upi_id || "mr.death4646@oksbi"}
                </div>
                <div className="text-xs text-zinc-400 mt-1">Account Holder: <span className="text-white font-medium">{paymentInfo?.upi_name || "Sanjay Mass"}</span></div>
              </div>

              <div className="bg-[#12151e] p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Amount to transfer now:</span>
                  <span className="text-lg font-bold text-white">₹{getEffectiveAmount()}</span>
                </div>
              </div>

              <a
                href={`upi://pay?pa=${paymentInfo?.upi_id || 'mr.death4646@oksbi'}&pn=${encodeURIComponent(paymentInfo?.upi_name || 'Sanjay Mass')}&am=${getEffectiveAmount()}&cu=INR`}
                className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-sm font-semibold border border-amber-500/30 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open UPI App to Pay (Mobile)</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Transaction ID / UTR ID <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">12-digit number from your UPI payment receipt</p>
              <input
                type="text"
                required
                placeholder="e.g. 428901823901 or UPI/4289..."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-[#0a0c12] border border-zinc-700/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Upload Payment Screenshot <span className="text-amber-400">*</span>
              </label>
              <p className="text-xs text-zinc-400 mb-2">Stored securely in Cloudflare R2 (Max 10 MB)</p>
              
              <div className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer bg-[#0a0c12] transition-colors">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {screenshotPreview ? (
                  <div className="flex items-center space-x-3">
                    <img src={screenshotPreview} alt="Screenshot preview" className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                    <div className="text-left text-xs text-zinc-300 truncate">
                      <p className="font-semibold text-amber-400">{screenshotFile?.name}</p>
                      <p className="text-zinc-500">{((screenshotFile?.size || 0) / 1024).toFixed(0)} KB • Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                    <span className="text-xs font-medium text-zinc-300">Click to upload screenshot</span>
                    <span className="text-[11px] text-zinc-500 mt-0.5">JPG, PNG, WebP up to 10 MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Terms and Conditions */}
        <div className="bg-[#12151e]/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md">
          <h2 className="text-base font-bold text-white mb-3">Terms and Condition</h2>
          <ul className="text-xs text-zinc-400 space-y-1.5 mb-6 list-disc list-inside bg-[#0a0c12] p-4 rounded-xl border border-zinc-800/80">
            <li>Registration will be confirmed only after payment verification.</li>
            <li>Registration fee is non-refundable under any circumstances.</li>
            <li>False information or fabricated screenshots will lead to immediate rejection.</li>
            <li>Participants must follow all instructions given by event coordinators.</li>
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

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-base shadow-xl flex items-center justify-center space-x-3 transition-all ${
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
                <span>Submit Runway Registration & Pay ₹{getEffectiveAmount()}</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-zinc-500 mt-2">
            Already registered and paying balance? <button type="button" onClick={() => setActiveTab('balance')} className="text-amber-400 hover:underline">Click here for Balance Form</button>
          </p>
        </div>
      </form>
    </div>
  );
}
