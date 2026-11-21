import React, { useState } from 'react';
import { Sparkles, CreditCard, UserCheck, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'register', label: 'Runway Registration', icon: Sparkles, isPrimary: true },
    { id: 'balance', label: 'Balance Payment', icon: CreditCard },
    { id: 'status', label: 'Check Status & Pass', icon: UserCheck },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d0f17]/95 backdrop-blur-md border-b border-amber-500/20">
      {/* Event Location & Schedule Top Announcement */}
      <div className="bg-gradient-to-r from-amber-950/90 via-[#221a0f] to-amber-950/90 border-b border-amber-500/30 py-1.5 px-4 text-center text-[11px] sm:text-xs text-amber-200/90 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="flex items-center space-x-1.5 text-amber-300 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>RUNWAY SHOW 2026:</span>
        </span>
        <span>Event Location: <strong className="text-white">Chennai (City Center — Not outer)</strong></span>
        <span className="text-amber-400/40 hidden sm:inline">•</span>
        <span>Venue &amp; Timings: <strong className="text-white">Announced 10 days before the event</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Emblem */}
          <div 
            onClick={() => handleNavClick('register')}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className="relative rounded-xl overflow-hidden bg-black border border-amber-500/30 p-1 shadow-lg shadow-amber-500/10 group-hover:border-amber-400/60 transition-all">
              <img 
                src="/logo.png" 
                alt="SKYRA CREATIONS — Runway Show 2026 Official Logo" 
                width={48}
                height={48}
                className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-amber-300 transition-colors">
                  SKYRA CREATIONS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold">
                  RUNWAY SHOW 2026
                </span>
              </div>
              <p className="text-xs text-zinc-400 tracking-wide">
                Official Fashion, Modelling &amp; Runway Event Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isPrimary) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/15'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-black" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Direct Quick Registration Action */}
            <button
              onClick={() => handleNavClick('register')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold shadow"
            >
              Register
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0d0f17] px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
            Runway Show 2026 Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : item.isPrimary
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive || item.isPrimary ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.isPrimary && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-black font-bold">
                    Join
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
