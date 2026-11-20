import React, { useState } from 'react';
import { 
  Sparkles, 
  CreditCard, 
  UserCheck, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight,
  Home
} from 'lucide-react';

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
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'register', label: 'Registration', icon: Sparkles },
    { id: 'balance', label: 'Balance Payment', icon: CreditCard, highlight: true },
    { id: 'status', label: 'Status & Pass', icon: UserCheck },
    { id: 'admin', label: 'Staff Portal', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#101213]/95 backdrop-blur-md border-b border-charcoal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Wordmark */}
          <div 
            onClick={() => handleNavClick('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-btn bg-charcoal-surface border border-charcoal-border flex items-center justify-center group-hover:border-lime-accent/50 transition-colors">
              <span className="font-editorial text-lg text-lime-accent font-semibold">SC</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-editorial text-2xl font-normal tracking-wide text-ivory group-hover:text-lime-accent transition-colors">
                  SKYRA CREATIONS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-accent"></span>
              </div>
              <p className="text-[11px] text-charcoal-muted tracking-wider uppercase font-mono">
                Runway 2026 • Management
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-btn text-xs uppercase tracking-wider font-medium transition-all ${
                    isActive
                      ? 'bg-charcoal-surface text-lime-accent border border-charcoal-border shadow-sm'
                      : item.highlight
                      ? 'text-lime-accent hover:bg-charcoal-card hover:text-[#c9f556]'
                      : 'text-charcoal-muted hover:text-ivory hover:bg-charcoal-card'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lime-accent' : 'text-charcoal-muted'}`} />
                  <span>{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse"></span>
                  )}
                </button>
              );
            })}

            {/* Quick Action CTA */}
            {activeTab !== 'register' && (
              <button
                onClick={() => handleNavClick('register')}
                className="ml-3 px-4 py-2 rounded-btn bg-lime-accent text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-[#c9f556] active:scale-[0.98] transition-all shadow-lime-glow flex items-center space-x-1.5"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => handleNavClick('register')}
              className="px-3 py-1.5 rounded-btn bg-lime-accent text-charcoal font-semibold text-xs uppercase tracking-wider"
            >
              Register
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-btn bg-charcoal-card border border-charcoal-border text-ivory hover:text-lime-accent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal-dark border-b border-charcoal-border px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-btn text-sm tracking-wide ${
                  isActive
                    ? 'bg-charcoal-surface text-lime-accent border border-charcoal-border'
                    : 'text-charcoal-muted hover:text-ivory hover:bg-charcoal-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-lime-accent" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-lime-accent/10 text-lime-accent border border-lime-accent/20">
                    Active
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
