import React, { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'landing', label: 'Home', icon: 'villa' },
    { id: 'register', label: 'Register', icon: 'app_registration' },
    { id: 'balance', label: 'Balance Portal', icon: 'account_balance_wallet', highlight: true },
    { id: 'status', label: 'Status & Pass', icon: 'verified' },
    { id: 'admin', label: 'Admin Portal', icon: 'admin_panel_settings' },
  ];

  return (
    <>
      {/* Top Fixed Header Bar */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.45)] border-b border-surface-variant/40">
        <div className="h-16 px-margin-mobile max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu" 
              className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors focus:outline-none md:hidden"
            >
              <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            
            <div 
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-space-sm cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
                SC
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">
                  SKYRA CREATIONS
                </span>
                <span className="text-[10px] font-data-mono text-outline uppercase tracking-wider">
                  Runway 2026 // Paris & Milan
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-label-md uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-primary hover:bg-surface-container'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Profile / Status Quick Action */}
          <div className="flex items-center gap-space-xs">
            <button 
              onClick={() => handleNavClick('status')}
              aria-label="Check Status & Pass" 
              className="w-11 h-11 flex items-center justify-center focus:outline-none"
              title="Check Digital Pass"
            >
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-base">badge</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-variant p-4 space-y-1">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-label-md tracking-wide ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[10px] font-data-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Due
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_16px_rgba(0,0,0,0.5)] md:hidden border-t border-surface-variant/30">
        <div className="flex justify-around items-center h-16 px-space-sm">
          <button
            onClick={() => handleNavClick('landing')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all focus:outline-none ${
              activeTab === 'landing' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">villa</span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider">Home</span>
            {activeTab === 'landing' && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-0.5"></span>}
          </button>

          <button
            onClick={() => handleNavClick('register')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all focus:outline-none ${
              activeTab === 'register' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">app_registration</span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider">Register</span>
            {activeTab === 'register' && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-0.5"></span>}
          </button>

          <button
            onClick={() => handleNavClick('balance')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all focus:outline-none ${
              activeTab === 'balance' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider">Balance</span>
            {activeTab === 'balance' && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-0.5"></span>}
          </button>

          <button
            onClick={() => handleNavClick('status')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all focus:outline-none ${
              activeTab === 'status' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">verified</span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider">Pass</span>
            {activeTab === 'status' && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-0.5"></span>}
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all focus:outline-none ${
              activeTab === 'admin' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            <span className="font-label-caps text-[10px] uppercase tracking-wider">Admin</span>
            {activeTab === 'admin' && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-0.5"></span>}
          </button>
        </div>
      </nav>
    </>
  );
}
