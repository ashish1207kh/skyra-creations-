import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, UserCheck, Sparkles, CreditCard } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'what-we-do', label: 'DISCIPLINES' },
    { id: 'events', label: 'EVENTS' },
    { id: 'gallery', label: 'ARCHIVE' },
    { id: 'contact', label: 'CONTACT' },
  ];

  const handleNavClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }, [setActiveTab]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(5, 5, 7, 0.92)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center cursor-pointer group select-none py-1 shrink-0"
            >
              <div className="relative flex items-center">
                {/* Dynamic Ambient Aura on Hover */}
                <div 
                  className="absolute -inset-2 rounded-xl blur-lg opacity-40 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.45) 0%, rgba(198, 255, 0, 0.25) 50%, transparent 75%)',
                  }}
                />
                
                {/* Official Brandmark Image */}
                <img
                  src="/logo-clean.png"
                  alt="SKYRA CREATIONS Official Logo"
                  className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.9)) contrast(1.08)',
                  }}
                />
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-5 xl:space-x-8 shrink-0">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id || (link.id === 'events' && activeTab === 'event-details');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="relative py-2 font-mono-editorial text-[10px] xl:text-[11px] tracking-[0.16em] xl:tracking-[0.18em] transition-colors hover:text-[#C6FF00]"
                    style={{
                      color: isActive ? '#C6FF00' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ backgroundColor: '#C6FF00' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Right CTAs */}
            <div className="hidden lg:flex items-center space-x-3.5 xl:space-x-5 shrink-0">
              <button
                onClick={() => handleNavClick('payment')}
                className={`font-mono-editorial text-[11px] tracking-wider py-2 px-2.5 transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'payment' || activeTab === 'balance'
                    ? 'text-[#C6FF00]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Official Payment & Balance Portal"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#C6FF00]" />
                <span>PAYMENT</span>
              </button>

              <button
                onClick={() => handleNavClick('register')}
                className="px-5 py-2.5 rounded-sm font-mono-editorial text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 flex items-center space-x-1.5 shadow-lg"
                style={{
                  backgroundColor: '#C6FF00',
                  color: '#000000',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>REGISTER</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                onClick={() => handleNavClick('register')}
                className="px-3.5 py-1.5 rounded-sm font-mono-editorial text-[10px] font-bold tracking-wider"
                style={{ backgroundColor: '#C6FF00', color: '#000000' }}
              >
                REGISTER
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:text-[#C6FF00] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-50 flex flex-col justify-between"
            style={{ backgroundColor: '#050507' }}
          >
            {/* Header in Drawer */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-white/10">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => handleNavClick('home')}
              >
                <img 
                  src="/logo-clean.png" 
                  alt="SKYRA CREATIONS Official Logo" 
                  className="h-10 w-auto object-contain" 
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white hover:text-[#C6FF00]"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col px-8 py-8 space-y-4">
              {navLinks.map((link, i) => {
                const isActive = activeTab === link.id;
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left font-display text-3xl font-bold py-2 transition-colors flex items-center justify-between"
                    style={{
                      color: isActive ? '#C6FF00' : '#F5F5F5',
                    }}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#C6FF00]" />}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer in Drawer */}
            <div className="p-8 space-y-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2 font-mono-editorial text-xs text-center text-zinc-400">
                <button onClick={() => handleNavClick('payment')} className="p-2 bg-white/5 rounded-sm hover:text-white">
                  PAYMENT
                </button>
                <button onClick={() => handleNavClick('status')} className="p-2 bg-white/5 rounded-sm hover:text-white">
                  PASS
                </button>
                <button onClick={() => handleNavClick('admin')} className="p-2 bg-white/5 rounded-sm hover:text-white">
                  ADMIN
                </button>
              </div>

              <button
                onClick={() => handleNavClick('register')}
                className="w-full py-4 font-mono-editorial text-xs font-bold uppercase tracking-widest rounded-sm"
                style={{ backgroundColor: '#C6FF00', color: '#000000' }}
              >
                REGISTER NOW
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
