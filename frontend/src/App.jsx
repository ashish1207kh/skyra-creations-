import React, { useState } from 'react';
import Navbar from './components/Navbar';
import RegistrationPage from './pages/RegistrationPage';
import BalancePaymentPage from './pages/BalancePaymentPage';
import StatusPassPage from './pages/StatusPassPage';
import AdminPage from './pages/AdminPage';
import { Sparkles, Phone, Mail } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [balanceRegId, setBalanceRegId] = useState('');
  const [lookupRegId, setLookupRegId] = useState('');

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
          <AdminPage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#090b10] border-t border-zinc-800/80 py-10 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-amber-400">SKYRA CREATIONS</span>
            <span>•</span>
            <span>Fashion Model Training &amp; Events Organising</span>
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
              Balance Payment
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
