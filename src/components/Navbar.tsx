import React from 'react';
import { Sparkles, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'register', label: 'Runway Registration', icon: Sparkles },
    { id: 'balance', label: 'Balance Payment', icon: CreditCard, highlight: true },
    { id: 'status', label: 'Check Status & Pass', icon: UserCheck },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0d0f17]/95 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('register')}
            className="flex items-center space-x-3.5 cursor-pointer group"
          >
            <div className="relative rounded-xl overflow-hidden bg-black border border-amber-500/30 p-1 shadow-lg shadow-amber-500/10 group-hover:border-amber-400/60 transition-all">
              <img 
                src="/logo.png" 
                alt="Skyra Creations" 
                className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-amber-300 transition-colors">
                  SKYRA CREATIONS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Runway 2026
                </span>
              </div>
              <p className="text-xs text-zinc-400 tracking-wide">Vercel & Supabase Powered Fashion Portal</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : item.highlight
                      ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Quick Switcher */}
          <div className="flex md:hidden items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`p-2.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
