import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme, ThemeMode } from '../lib/theme';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'what-we-do', label: 'What We Do' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }, [setActiveTab]);

  // Scroll listener for transparent → solid transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Cycle theme: dark → light → system → dark
  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ['dark', 'light', 'system'];
    const idx = order.indexOf(themeMode);
    setThemeMode(order[(idx + 1) % order.length]);
  }, [themeMode, setThemeMode]);

  const ThemeIcon = themeMode === 'system'
    ? Monitor
    : resolvedTheme === 'dark'
      ? Moon
      : Sun;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'var(--bg-secondary)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center justify-between transition-all duration-300"
            style={{ height: scrolled ? '64px' : '80px' }}
          >
            {/* Logo & Brand */}
            <div
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <img
                src="/logo.png"
                alt="SKYRA CREATIONS Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
              />
              <span
                className="font-display text-lg sm:text-xl font-bold tracking-wide transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                SKYRA
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = activeTab === link.id || (link.id === 'events' && activeTab === 'event-details');
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="font-mono-editorial relative px-4 py-2 transition-colors"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full"
                        style={{ backgroundColor: 'var(--accent)' }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side: Theme toggle + Register CTA */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Compact Theme Toggle */}
              <button
                type="button"
                onClick={cycleTheme}
                className="p-2.5 rounded-full transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
                aria-label={`Theme: ${themeMode}. Click to cycle.`}
                title={`Theme: ${themeMode}`}
              >
                <ThemeIcon className="w-4 h-4" />
              </button>

              {/* Register CTA */}
              <button
                onClick={() => handleNavClick('register')}
                className="font-mono-editorial px-5 py-2.5 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000',
                }}
              >
                REGISTER
              </button>
            </div>

            {/* Mobile Right Controls */}
            <div className="flex lg:hidden items-center space-x-2">
              <button
                type="button"
                onClick={cycleTheme}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Toggle theme"
              >
                <ThemeIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            {/* Mobile Header */}
            <div
              className="flex items-center justify-between px-4 h-16 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                onClick={() => handleNavClick('home')}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <img
                  src="/logo.png"
                  alt="SKYRA CREATIONS Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain"
                />
                <span
                  className="font-display text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  SKYRA
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 flex flex-col justify-center px-8 space-y-2">
              {navLinks.map((link, i) => {
                const isActive = activeTab === link.id;
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => handleNavClick(link.id)}
                    className="text-left font-editorial text-3xl sm:text-4xl font-bold py-3 transition-colors"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {link.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Bottom Actions */}
            <div
              className="flex-shrink-0 px-8 pb-10 pt-6 space-y-6"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {/* Theme selector row */}
              <div className="flex items-center space-x-3">
                <span
                  className="font-mono-editorial"
                  style={{ color: 'var(--text-muted)' }}
                >
                  THEME
                </span>
                <div className="flex space-x-1">
                  {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => {
                    const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
                    const isSelected = themeMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setThemeMode(mode)}
                        className="p-2.5 rounded-full transition-colors"
                        style={{
                          backgroundColor: isSelected ? 'var(--surface)' : 'transparent',
                          color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                          border: isSelected ? '1px solid var(--border)' : '1px solid transparent',
                        }}
                        aria-label={`${mode} theme`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile utility links */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleNavClick('status')}
                  className="font-mono-editorial transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  STATUS / PASS
                </button>
                <span style={{ color: 'var(--border)' }}>·</span>
                <button
                  onClick={() => handleNavClick('balance')}
                  className="font-mono-editorial transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  BALANCE
                </button>
                <span style={{ color: 'var(--border)' }}>·</span>
                <button
                  onClick={() => handleNavClick('admin')}
                  className="font-mono-editorial transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ADMIN
                </button>
              </div>

              {/* Register CTA */}
              <button
                onClick={() => handleNavClick('register')}
                className="w-full py-4 rounded-full font-mono-editorial text-sm font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#000000',
                }}
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
