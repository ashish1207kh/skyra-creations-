import React from 'react';
import { Sparkles, Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import MagneticButton from '../components/MagneticButton';

interface NotFoundPageProps {
  setActiveTab: (tab: string) => void;
}

export default function NotFoundPage({ setActiveTab }: NotFoundPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-20 px-4 sm:px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-[#12141a] border border-white/10 rounded-sm p-8 sm:p-14 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6FF00] to-transparent" />

        <div className="w-16 h-16 rounded-sm bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center mx-auto mb-6 text-[#C6FF00] shadow-lg">
          <HelpCircle className="w-8 h-8" />
        </div>

        <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-widest text-[#C6FF00] block mb-2">
          404 — ROUTE UNCHARTED
        </span>

        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight mb-4">
          LOOKING FOR THE RUNWAY?
        </h1>

        <p className="text-[#BFC3C7] text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed font-light">
          The page or link you requested is not part of the active showcase catalog. Use the navigation portals below to return to the official platform.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8 font-mono-editorial">
          <MagneticButton
            onClick={() => setActiveTab('register')}
            className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-sm bg-[#C6FF00] hover:bg-[#D8FF33] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>REGISTRATION</span>
          </MagneticButton>

          <button
            onClick={() => setActiveTab('status')}
            className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-sm bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/15"
          >
            <Search className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>CHECK STATUS</span>
          </button>

          <button
            onClick={() => setActiveTab('balance')}
            className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-sm bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/15"
          >
            <Home className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span>BALANCE</span>
          </button>
        </div>

        <p className="font-mono-editorial text-[11px] text-zinc-500">
          Official Support Desk: Call <strong>+91 93420 49287</strong> or connect on Instagram @skyra_creations_.
        </p>
      </motion.div>
    </div>
  );
}
