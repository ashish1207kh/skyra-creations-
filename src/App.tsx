import React, { useState } from 'react';
import Navbar from './components/Navbar';
import RegistrationPage from './pages/RegistrationPage';
import BalancePaymentPage from './pages/BalancePaymentPage';
import StatusPassPage from './pages/StatusPassPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('register');
  const [balanceRegId, setBalanceRegId] = useState<string>('');
  const [lookupRegId, setLookupRegId] = useState<string>('');

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
      </main>

      {/* Footer Content */}
      <footer className="bg-[#090b10] border-t border-zinc-800/80 py-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-800/60">
            {/* Brand & Description */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-black border border-amber-500/30 p-1 flex items-center justify-center shadow-lg">
                  <img src="/logo.png" alt="Skyra Creations Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-serif text-lg font-bold tracking-wider text-white">SKYRA CREATIONS</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Creating opportunities for aspiring and professional models through fashion, modelling and runway experiences.
              </p>
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
            <span>© 2026 SKYRA CREATIONS. All rights reserved.</span>
            <span>Runway Show 2026 Registration Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
