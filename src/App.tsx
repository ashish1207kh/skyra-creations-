import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationPage from './pages/RegistrationPage';
import BalancePaymentPage from './pages/BalancePaymentPage';
import StatusPassPage from './pages/StatusPassPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { updatePageSeo } from './lib/seo';

function getTabFromPath(pathname: string): string {
  const p = pathname.toLowerCase().replace(/\/+$/, '');
  if (p === '' || p === '/' || p === '/register') return 'register';
  if (p === '/balance' || p === '/balance-payment') return 'balance';
  if (p === '/status' || p === '/check-status') return 'status';
  if (p === '/admin') return 'admin';
  return 'not-found';
}

function getPathFromTab(tab: string): string {
  if (tab === 'register') return '/register';
  if (tab === 'balance') return '/balance';
  if (tab === 'status') return '/status';
  if (tab === 'admin') return '/admin';
  return '/';
}

export default function App() {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return typeof window !== 'undefined' ? getTabFromPath(window.location.pathname) : 'register';
  });
  const [balanceRegId, setBalanceRegId] = useState<string>('');
  const [lookupRegId, setLookupRegId] = useState<string>('');

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    updatePageSeo(tab);
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromTab(tab);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    updatePageSeo(activeTab);

    const handlePopState = () => {
      const currentTab = getTabFromPath(window.location.pathname);
      setActiveTabState(currentTab);
      updatePageSeo(currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d13] text-zinc-100">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1">
        {activeTab === 'register' && (
          <RegistrationPage 
            setActiveTab={setActiveTab} 
            setLookupRegId={(id) => {
              setLookupRegId(id);
              setActiveTab('status');
            }} 
          />
        )}

        {activeTab === 'balance' && (
          <BalancePaymentPage 
            initialRegId={balanceRegId} 
            setActiveTab={setActiveTab}
            setLookupRegId={(id) => {
              setLookupRegId(id);
              setActiveTab('status');
            }} 
          />
        )}

        {activeTab === 'status' && (
          <StatusPassPage 
            initialRegId={lookupRegId} 
            setActiveTab={setActiveTab}
            setBalanceRegId={(id) => {
              setBalanceRegId(id);
              setActiveTab('balance');
            }} 
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'not-found' && (
          <NotFoundPage setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Footer Content */}
      <footer className="bg-[#090b10] border-t border-zinc-800/80 py-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/60">
            {/* Brand & Description */}
            <div className="space-y-3 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/30 p-1 flex items-center justify-center shadow-lg">
                  <img 
                    src="/logo.png" 
                    alt="SKYRA CREATIONS — Official Fashion, Modelling & Runway Emblem" 
                    width={40}
                    height={40}
                    className="w-full h-full object-contain" 
                  />
                </div>
                <span className="font-serif text-lg font-bold tracking-wider text-white">SKYRA CREATIONS</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Creating opportunities for aspiring and professional runway models through premier fashion experiences, modelling auditions and designer showcases.
              </p>
              
              {/* Official Social Links (Phase 9: Instagram Brand Consistency) */}
              <div className="pt-1">
                <a
                  href="https://www.instagram.com/skyra_creations_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-pink-950/30 hover:bg-pink-900/40 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all group shadow-sm"
                  aria-label="Follow SKYRA CREATIONS on Instagram @skyra_creations_"
                >
                  <svg className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Follow @skyra_creations_</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-300 font-medium">
              <button 
                onClick={() => setActiveTab('register')}
                className="hover:text-amber-400 transition-colors"
              >
                Runway Registration
              </button>
              <button 
                onClick={() => setActiveTab('balance')}
                className="hover:text-amber-400 transition-colors"
              >
                Balance Payment
              </button>
              <button 
                onClick={() => setActiveTab('status')}
                className="hover:text-amber-400 transition-colors"
              >
                Check Status &amp; Pass
              </button>
              <button 
                onClick={() => setActiveTab('admin')}
                className="hover:text-amber-400 transition-colors"
              >
                Admin Portal
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
            <span>© 2026 SKYRA CREATIONS. All rights reserved. Official Runway Show 2026 Portal.</span>
            <div className="flex items-center space-x-4">
              <span>Event Location: Chennai City Center</span>
              <span>•</span>
              <a 
                href="https://www.instagram.com/skyra_creations_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-amber-300 transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
