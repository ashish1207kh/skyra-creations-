import React from 'react';
import { Sparkles, Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

interface NotFoundPageProps {
  setActiveTab: (tab: string) => void;
}

export default function NotFoundPage({ setActiveTab }: NotFoundPageProps) {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 text-center">
      <div className="bg-[#12151e] border-2 border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200"></div>

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-lg">
          <HelpCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
          404 — PAGE NOT FOUND
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Looking for the Runway?
        </h1>

        <p className="text-zinc-300 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
          The page or link you are trying to reach does not exist or has been moved. Use the options below to navigate back to our official event portal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-8">
          <button
            onClick={() => setActiveTab('register')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Runway Registration</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors border border-zinc-700 shadow-sm"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>Check Status &amp; Pass</span>
          </button>

          <button
            onClick={() => setActiveTab('balance')}
            className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors border border-zinc-700 shadow-sm"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>Balance Payment</span>
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Need event assistance? Connect with our team directly on{' '}
          <a
            href="https://www.instagram.com/skyra_creations_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline font-medium"
          >
            Instagram @skyra_creations_
          </a>{' '}
          or call <strong>+91 9342049287</strong>.
        </p>
      </div>
    </div>
  );
}
