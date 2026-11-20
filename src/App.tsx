import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import BalancePaymentPage from './pages/BalancePaymentPage';
import StatusPassPage from './pages/StatusPassPage';
import AdminDashboard from './pages/AdminDashboard';
import { getPaymentInfo } from './lib/api';
import { PaymentInfo } from './types/index';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [balanceRegId, setBalanceRegId] = useState<string>('');
  const [lookupRegId, setLookupRegId] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    getPaymentInfo()
      .then(data => setPaymentInfo(data))
      .catch(err => console.error("Error loading event payment info", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-charcoal text-ivory">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            paymentInfo={paymentInfo}
          />
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
      </main>

      {/* Editorial Luxury Footer */}
      <footer className="bg-[#101213] border-t border-charcoal-border py-12 text-xs text-charcoal-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-charcoal-border/60 gap-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-editorial text-2xl text-ivory tracking-wider">SKYRA CREATIONS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-accent"></span>
              </div>
              <p className="text-xs text-charcoal-muted mt-1 font-light max-w-sm">
                Runway Show 2026 Edition • Production, Talent Curation & Professional Event Management Platform.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs uppercase font-mono tracking-wider">
              <button 
                onClick={() => { setActiveTab('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-lime-accent transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => { setActiveTab('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-lime-accent transition-colors"
              >
                Registration
              </button>
              <button 
                onClick={() => { setActiveTab('balance'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-lime-accent transition-colors"
              >
                Balance Portal
              </button>
              <button 
                onClick={() => { setActiveTab('status'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-lime-accent transition-colors"
              >
                Digital Pass
              </button>
              <button 
                onClick={() => { setActiveTab('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-lime-accent transition-colors"
              >
                Staff Portal
              </button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-charcoal-muted">
            <div className="flex items-center space-x-2">
              <span>Merchant: mr.death4646@oksbi (Sanjay Mass)</span>
              <span>•</span>
              <span className="text-lime-accent">100% Bank Statement Reconciliation</span>
            </div>

            <div>
              <span>© 2026 SKYRA CREATIONS. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
