import React, { useState } from 'react';
import { 
  Sparkles, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Laptop, 
  Calendar, 
  Info, 
  Layers, 
  Image as ImageIcon, 
  Phone, 
  UserCheck, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useTheme, ThemeMode } from '../lib/theme';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'what-we-do', label: 'What We Do' },
    { id: 'events', label: 'Upcoming Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d0f17]/95 dark:bg-[#0a0c12]/95 light:bg-white/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Top Event Announcement Ticker */}
      <div className="bg-gradient-to-r from-zinc-900 via-amber-950 to-zinc-900 border-b border-amber-500/20 py-1.5 px-4 text-center text-[11px] text-amber-200/90 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="flex items-center space-x-1.5 text-[#d4ff14] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff14] animate-ping" />
          <span>RUNWAY SHOW 2026:</span>
        </span>
        <span className="text-zinc-300">
          Location: <strong className="text-white">Chennai City Center</strong>
        </span>
        <span className="text-amber-400/30 hidden sm:inline">•</span>
        <span className="text-zinc-400 hidden sm:inline">
          Reporting Timings Released 10 Days Before Event
        </span>
        <span className="text-amber-400/30 hidden sm:inline">•</span>
        <button
          onClick={() => handleNavClick('events')}
          className="text-amber-300 hover:text-white underline font-semibold transition-colors"
        >
          View Event Details
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-black border border-amber-500/30 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-400 transition-all">
              <img 
                src="/logo.png" 
                alt="SKYRA CREATIONS Logo" 
                width={40}
                height={40}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <span className="font-editorial text-lg sm:text-xl font-bold tracking-wider text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors block">
                SKYRA CREATIONS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block font-medium">
                Fashion • Runway • Modelling
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id || (link.id === 'events' && activeTab === 'event-details');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'text-amber-500 dark:text-amber-400 bg-amber-500/10 font-bold'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Status + Theme Switcher + Register CTA */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Check Status / Pass */}
            <button
              onClick={() => handleNavClick('status')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                activeTab === 'status'
                  ? 'text-amber-500 bg-amber-500/10 border border-amber-500/30'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              title="Check Registration Status or Pass"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>Pass</span>
            </button>

            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center space-x-1"
                aria-label="Toggle theme mode"
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setThemeMode('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors ${
                      themeMode === 'dark' 
                        ? 'bg-amber-500/10 text-amber-500 font-bold' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('light');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors ${
                      themeMode === 'light' 
                        ? 'bg-amber-500/10 text-amber-500 font-bold' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemeMode('system');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl transition-colors ${
                      themeMode === 'system' 
                        ? 'bg-amber-500/10 text-amber-500 font-bold' 
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>System Default</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Register CTA */}
            <button
              onClick={() => handleNavClick('register')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-[#d4ff14] text-black font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Register Now</span>
            </button>
          </div>

          {/* Mobile Right Controls: Theme + Hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle dark/light mode"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('register')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
            >
              Register
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0c12] px-4 pt-4 pb-8 space-y-2 shadow-2xl animate-fadeIn">
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Navigation Menu
          </div>

          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
              </button>
            );
          })}

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <button
              onClick={() => handleNavClick('balance')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Balance Payment Clearance</span>
              <span className="text-[10px] text-amber-500">→</span>
            </button>

            <button
              onClick={() => handleNavClick('status')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Check Status &amp; Digital Pass</span>
              <span className="text-[10px] text-amber-500">→</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Admin Portal</span>
              <span className="text-[10px] text-zinc-500">🔒</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
