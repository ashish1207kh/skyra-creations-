import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, UserCheck, Sparkles } from 'lucide-react';
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
            {/* Brand Logo & Title */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-3.5 cursor-pointer group select-none"
            >
              {/* Premium Circular Haute Couture Emblem */}
              <div className="relative shrink-0 flex items-center justify-center">
                {/* Dynamic Ambient Aura */}
                <div 
                  className="absolute -inset-1 rounded-full blur-md opacity-45 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.45) 0%, rgba(198, 255, 0, 0.25) 50%, transparent 75%)',
                  }}
                />
                
                {/* Precision Haute Couture Bezel */}
                <div
                  className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full p-[1.5px] shadow-2xl transition-all duration-500 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(198, 255, 0, 0.3) 45%, rgba(220, 38, 38, 0.5) 100%)',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center p-0.5">
                    <img
                      src="/logo.png"
                      alt="SKYRA CREATIONS Official Logo"
                      width={52}
                      height={52}
                      className="w-full h-full object-cover rounded-full scale-[1.08] group-hover:scale-[1.15] transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Refined Brand Wordmark */}
              <div className="flex flex-col">
                <span
                  className="font-display text-base sm:text-lg font-extrabold tracking-[0.18em] block transition-colors group-hover:text-[#C6FF00]"
                  style={{ color: '#F5F5F5' }}
                >
                  SKYRA CREATIONS
                </span>
                <span
                  className="font-mono-editorial block text-[9px] tracking-[0.24em] font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  HAUTE COUTURE • RUNWAY
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id || (link.id === 'events' && activeTab === 'event-details');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="relative py-2 font-mono-editorial text-[11px] tracking-[0.18em] transition-colors hover:text-[#C6FF00]"
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
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => handleNavClick('status')}
                className="font-mono-editorial text-[11px] tracking-wider py-2 px-3 transition-colors hover:text-white flex items-center space-x-1.5"
                style={{ color: 'var(--text-muted)' }}
                title="Check Verification Status or Pass"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C6FF00]" />
                <span>CHECK PASS</span>
              </button>

              <button
                onClick={() => handleNavClick('register')}
                className="px-6 py-2.5 rounded-sm font-mono-editorial text-xs font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 flex items-center space-x-1.5 shadow-lg"
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
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => handleNavClick('home')}
              >
                <div className="relative w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-white/40 via-[#C6FF00]/30 to-red-600/40 shadow-lg">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center p-0.5">
                    <img 
                      src="/logo.png" 
                      alt="SKYRA CREATIONS Logo" 
                      className="w-full h-full object-cover rounded-full scale-[1.08]" 
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-base font-extrabold text-white tracking-widest">
                    SKYRA CREATIONS
                  </span>
                  <span className="font-mono-editorial text-[8px] tracking-[0.2em] text-zinc-400">
                    HAUTE COUTURE • RUNWAY
                  </span>
                </div>
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
              <div className="flex justify-between font-mono-editorial text-xs text-zinc-400">
                <button onClick={() => handleNavClick('status')} className="hover:text-white">STATUS / PASS</button>
                <span>·</span>
                <button onClick={() => handleNavClick('balance')} className="hover:text-white">BALANCE</button>
                <span>·</span>
                <button onClick={() => handleNavClick('admin')} className="hover:text-white">ADMIN</button>
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
