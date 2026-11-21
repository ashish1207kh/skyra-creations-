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
    <div 
      className="min-h-screen flex flex-col transition-colors"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
        {/* Navigation Header */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className={`flex-1 ${activeTab === 'home' ? '' : 'pt-24'}`}>
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
        <footer 
          className="py-16 text-xs transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderTop: '1px solid var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
              {/* Brand & Description */}
              <div className="space-y-4 max-w-md">
                <div 
                  onClick={() => setActiveTab('home')}
                  className="flex items-center cursor-pointer group select-none py-1"
                >
                  <div className="relative flex items-center">
                    <div 
                      className="absolute -inset-2 rounded-xl blur-md opacity-35 group-hover:opacity-75 transition-opacity pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, rgba(198, 255, 0, 0.25) 50%, transparent 70%)',
                      }}
                    />
                    <img 
                      src="/logo-clean.png" 
                      alt="SKYRA CREATIONS Official Logo" 
                      className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
                      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}
                    />
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-light" style={{ color: 'var(--text-muted)' }}>
                  A premier fashion, runway and modelling event platform empowering emerging talent through professional catwalk showcases, stage grooming and designer collaborations.
                </p>

                {/* Instagram Quick Link */}
                <div className="pt-1">
                  <a
                    href="https://www.instagram.com/skyra_creations_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all group shadow-sm"
                    style={{ 
                      backgroundColor: 'var(--surface)', 
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C] group-hover:scale-110 transition-transform" />
                    <span className="font-mono-editorial" style={{ fontSize: '10px' }}>@skyra_creations_</span>
                  </a>
                </div>
              </div>

              {/* Navigation Links Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-medium">
                <div className="space-y-3">
                  <span className="font-mono-editorial block" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>EXPLORE</span>
                  <button onClick={() => setActiveTab('home')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Home</button>
                  <button onClick={() => setActiveTab('about')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>About Us</button>
                  <button onClick={() => setActiveTab('what-we-do')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>What We Do</button>
                </div>

                <div className="space-y-3">
                  <span className="font-mono-editorial block" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>EVENTS</span>
                  <button onClick={() => setActiveTab('events')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Upcoming Events</button>
                  <button onClick={() => setActiveTab('register')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Runway Registration</button>
                  <button onClick={() => setActiveTab('gallery')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Photo Gallery</button>
                </div>

                <div className="space-y-3 col-span-2 sm:col-span-1">
                  <span className="font-mono-editorial block" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>SUPPORT</span>
                  <button onClick={() => setActiveTab('balance')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Balance Payment</button>
                  <button onClick={() => setActiveTab('status')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Check Status / Pass</button>
                  <button onClick={() => setActiveTab('contact')} className="block hover:opacity-75 transition-opacity" style={{ color: 'var(--text-secondary)' }}>Contact Support</button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Copyright + Legal Modals */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>© 2026 SKYRA CREATIONS. All rights reserved. BEYOND THE RUNWAY.</span>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="hover:underline transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Terms &amp; Conditions
                </button>
                <span>·</span>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:underline transition-all"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Privacy Policy
                </button>
                <span>·</span>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="hover:underline transition-all font-mono-editorial"
                  style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                >
                  ADMIN
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative rounded-sm"
              style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <button
                onClick={() => setShowTermsModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-primary)' }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 text-xs sm:text-sm">
                <h3 className="font-editorial text-2xl font-bold">
                  Official Terms and Conditions (Version 2026.2)
                </h3>
                <p className="font-mono-editorial" style={{ color: 'var(--text-muted)' }}>
                  Authoritative Participant Agreement &amp; Event Rules
                </p>

                <div className="space-y-3 pt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>1. Non-Refundable Fee Policy:</strong> The total event registration fee is ₹3,000. All fees, token advance payments (₹500, ₹1,000, ₹1,500), and balance payments are strictly non-refundable and non-transferable under all circumstances.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>2. Event Venue &amp; Timings:</strong> The event is held in Chennai City Center. Reporting timings, stage dress code, and exact auditorium coordinates are released to verified participants 10 days before the event.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>3. Model Conduct &amp; Compliance:</strong> Participants must adhere to stage choreography, rehearsal timings, and conduct guidelines issued by SKYRA CREATIONS event directors.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>4. Media Rights:</strong> Official event photographs, video recordings, and stage performances may be utilized by SKYRA CREATIONS for promotional lookbooks, event archives, and digital media.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Modal */}
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div 
              className="max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative rounded-sm"
              style={{ 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                color: 'var(--text-primary)'
              }}
            >
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-primary)' }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4 text-xs sm:text-sm">
                <h3 className="font-editorial text-2xl font-bold">
                  Privacy Policy &amp; Data Security
                </h3>
                <p className="font-mono-editorial" style={{ color: 'var(--text-muted)' }}>
                  How SKYRA CREATIONS protects participant data
                </p>

                <div className="space-y-3 pt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>1. PII Encryption:</strong> Sensitive participant details such as phone numbers, dates of birth, and WhatsApp contact numbers are encrypted using industry-standard AES-256-GCM.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>2. Cloudflare R2 Storage:</strong> Model photographs and payment receipts are stored securely in private Cloudflare R2 object storage with short-lived signed URLs. No public image URLs or base64 blobs are exposed.
                  </p>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>3. Data Retention:</strong> Registration records are retained solely for event coordination, verification pass issuance, and financial audit compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
