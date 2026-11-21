import React, { createContext, useContext, useEffect } from 'react';

export type ThemeMode = 'dark';

interface ThemeContextType {
  themeMode: 'dark';
  resolvedTheme: 'dark';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  resolvedTheme: 'dark',
  setThemeMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Pure Black Luxury Haute Couture — Permanent Dark Mode
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('skyra_theme_mode', 'dark');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode: 'dark', resolvedTheme: 'dark', setThemeMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
