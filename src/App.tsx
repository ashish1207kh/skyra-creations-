import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import WhatWeDoPage from './pages/WhatWeDoPage';
import UpcomingEventsPage from './pages/UpcomingEventsPage';
import EventDetailPage from './pages/EventDetailPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import RegistrationPage from './pages/RegistrationPage';
import BalancePaymentPage from './pages/BalancePaymentPage';
import StatusPassPage from './pages/StatusPassPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { updatePageSeo } from './lib/seo';
import { ThemeProvider } from './lib/theme';
import { Globe, Phone, ShieldCheck, X } from 'lucide-react';
import InstagramIcon from './components/InstagramIcon';

function getTabFromPath(pathname: string): string {
  const p = pathname.toLowerCase().replace(/\/+$/, '');
  if (p === '' || p === '/' || p === '/home') return 'home';
  if (p === '/about' || p === '/about-us') return 'about';
  if (p === '/what-we-do' || p === '/services') return 'what-we-do';
  if (p === '/events' || p === '/upcoming-events') return 'events';
  if (p === '/events/runway-2026' || p === '/event-details') return 'event-details';
  if (p === '/gallery') return 'gallery';
  if (p === '/contact' || p === '/contact-us') return 'contact';
  if (p === '/register') return 'register';
  if (p === '/balance' || p === '/balance-payment') return 'balance';
  if (p === '/status' || p === '/check-status') return 'status';
  if (p === '/admin') return 'admin';
  return 'not-found';
}

function getPathFromTab(tab: string): string {
  if (tab === 'home') return '/';
  if (tab === 'about') return '/about';
  if (tab === 'what-we-do') return '/what-we-do';
  if (tab === 'events') return '/events';
  if (tab === 'event-details') return '/events/runway-2026';
  if (tab === 'gallery') return '/gallery';
  if (tab === 'contact') return '/contact';
  if (tab === 'register') return '/register';
  if (tab === 'balance') return '/balance';
  if (tab === 'status') return '/status';
  if (tab === 'admin') return '/admin';
  return '/';
}

export default function App() {
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return typeof window !== 'undefined' ? getTabFromPath(window.location.pathname) : 'home';
  });
  const [selectedEventId, setSelectedEventId] = useState<string>('EVT-CHX-2026');
  const [balanceRegId, setBalanceRegId] = useState<string>('');
  const [lookupRegId, setLookupRegId] = useState<string>('');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

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
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#0a0c12] dark:bg-[#0a0c12] light:bg-[#f8fafc] text-zinc-900 dark:text-zinc-100 transition-colors">
        {/* Navigation Header */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomePage 
              setActiveTab={setActiveTab} 
              onSelectEvent={(id) => setSelectedEventId(id)}
            />
          )}

          {activeTab === 'about' && (
            <AboutPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'what-we-do' && (
            <WhatWeDoPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'events' && (
            <UpcomingEventsPage 
              setActiveTab={setActiveTab} 
              onSelectEvent={(id) => setSelectedEventId(id)}
            />
          )}

          {activeTab === 'event-details' && (
            <EventDetailPage 
              eventId={selectedEventId} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'contact' && (
            <ContactPage setActiveTab={setActiveTab} />
          )}

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

        {/* Unified Editorial Footer */}
        <footer className="bg-zinc-900/95 dark:bg-[#06080c] light:bg-zinc-100 border-t border-zinc-200 dark:border-zinc-800/80 py-12 text-xs text-zinc-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-zinc-800/60">
              {/* Brand & Description */}
              <div className="space-y-3 max-w-md">
                <div 
                  onClick={() => setActiveTab('home')}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/30 p-1 flex items-center justify-center shadow-lg group-hover:border-amber-400 transition-all">
                    <img 
                      src="/logo.png" 
                      alt="SKYRA CREATIONS Logo" 
                      width={40}
                      height={40}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="font-editorial text-lg font-bold tracking-wider text-zinc-900 dark:text-white">
                    SKYRA CREATIONS
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                  A premier fashion, runway and modelling event platform empowering emerging talent through professional catwalk showcases, stage grooming and designer collaborations.
                </p>

                {/* Instagram Quick Link */}
                <div className="pt-1">
                  <a
                    href="https://www.instagram.com/skyra_creations_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 border border-pink-500/30 text-xs font-semibold transition-all group shadow-sm"
                  >
                    <InstagramIcon className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                    <span>Follow @skyra_creations_</span>
                  </a>
                </div>
              </div>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">Explore</span>
                  <button onClick={() => setActiveTab('home')} className="block hover:text-amber-500 transition-colors">Home</button>
                  <button onClick={() => setActiveTab('about')} className="block hover:text-amber-500 transition-colors">About Us</button>
                  <button onClick={() => setActiveTab('what-we-do')} className="block hover:text-amber-500 transition-colors">What We Do</button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">Events</span>
                  <button onClick={() => setActiveTab('events')} className="block hover:text-amber-500 transition-colors">Upcoming Events</button>
                  <button onClick={() => setActiveTab('register')} className="block hover:text-amber-500 transition-colors">Runway Registration</button>
                  <button onClick={() => setActiveTab('gallery')} className="block hover:text-amber-500 transition-colors">Photo Gallery</button>
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">Support</span>
                  <button onClick={() => setActiveTab('balance')} className="block hover:text-amber-500 transition-colors">Balance Payment</button>
                  <button onClick={() => setActiveTab('status')} className="block hover:text-amber-500 transition-colors">Check Status / Pass</button>
                  <button onClick={() => setActiveTab('contact')} className="block hover:text-amber-500 transition-colors">Contact Support</button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Copyright + Legal Modals */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
              <span>© 2026 SKYRA CREATIONS. All rights reserved. Official Runway Showcase Platform.</span>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-amber-500 transition-colors"
                >
                  Terms &amp; Conditions
                </button>
                <span>•</span>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-amber-500 transition-colors"
                >
                  Privacy Policy
                </button>
                <span>•</span>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="hover:text-amber-500 transition-colors"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <h3 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
                  Official Terms and Conditions (Version 2026.2)
                </h3>
                <p className="text-xs text-zinc-500">
                  Authoritative Participant Agreement &amp; Event Rules
                </p>

                <div className="space-y-3 pt-2 leading-relaxed">
                  <p>
                    <strong>1. Non-Refundable Fee Policy:</strong> The total event registration fee is ₹3,000. All fees, token advance payments (₹500, ₹1,000, ₹1,500), and balance payments are strictly non-refundable and non-transferable under all circumstances.
                  </p>
                  <p>
                    <strong>2. Event Venue &amp; Timings:</strong> The event is held in Chennai City Center. Reporting timings, stage dress code, and exact auditorium coordinates are released to verified participants 10 days before the event.
                  </p>
                  <p>
                    <strong>3. Model Conduct &amp; Compliance:</strong> Participants must adhere to stage choreography, rehearsal timings, and conduct guidelines issued by SKYRA CREATIONS event directors.
                  </p>
                  <p>
                    <strong>4. Media Rights:</strong> Official event photographs, video recordings, and stage performances may be utilized by SKYRA CREATIONS for promotional lookbooks, event archives, and digital media.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                <h3 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
                  Privacy Policy &amp; Data Security
                </h3>
                <p className="text-xs text-zinc-500">
                  How SKYRA CREATIONS protects participant data
                </p>

                <div className="space-y-3 pt-2 leading-relaxed">
                  <p>
                    <strong>1. PII Encryption:</strong> Sensitive participant details such as phone numbers, dates of birth, and WhatsApp contact numbers are encrypted using industry-standard AES-256-GCM.
                  </p>
                  <p>
                    <strong>2. Cloudflare R2 Storage:</strong> Model photographs and payment receipts are stored securely in private Cloudflare R2 object storage with short-lived signed URLs. No public image URLs or base64 blobs are exposed.
                  </p>
                  <p>
                    <strong>3. Data Retention:</strong> Registration records are retained solely for event coordination, verification pass issuance, and financial audit compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
