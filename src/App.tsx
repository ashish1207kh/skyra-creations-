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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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

      {/* Footer */}
      <footer className="bg-[#090b10] border-t border-zinc-800/80 py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Skyra Creations Logo" className="w-8 h-8 object-contain rounded-md bg-black border border-amber-500/30 p-0.5" />
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-amber-400">SKYRA CREATIONS</span>
              <span>•</span>
              <span>Runway Show 2026 Portal</span>
              <span>•</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Vercel • Supabase • Cloudflare R2</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-zinc-400">
            <button 
              onClick={() => setActiveTab('register')}
              className="hover:text-amber-400 transition-colors"
            >
              Registration
            </button>
            <button 
              onClick={() => setActiveTab('balance')}
              className="hover:text-amber-400 transition-colors"
            >
              Balance Portal
            </button>
            <button 
              onClick={() => setActiveTab('status')}
              className="hover:text-amber-400 transition-colors"
            >
              Check Pass
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className="hover:text-amber-400 transition-colors"
            >
              Staff Portal
            </button>
          </div>

          <div>
            <span>© 2026 Skyra Creations. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
