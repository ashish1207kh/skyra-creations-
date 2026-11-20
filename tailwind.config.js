/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          dark: '#101213',     // Secondary background
          DEFAULT: '#17191B',  // Primary background
          card: '#25292B',     // Card background
          surface: '#2D3234',  // Elevated surface
          border: '#373C3E',   // Borders
          muted: '#A5AAA5',    // Secondary text on dark
          text: '#17191B',     // Primary dark text on light
        },
        lime: {
          accent: '#B8E34B',   // Primary accent (Electric Lime)
          soft: '#E4EDCB',     // Soft accent
          DEFAULT: '#B8E34B',
        },
        ivory: {
          DEFAULT: '#F6F8F2',  // Primary light background / text
          muted: '#EDEFE8',    // Muted background
        },
        status: {
          success: '#22C55E',
          pending: '#F59E0B',
          rejected: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'input': '8px',
        'btn': '8px',
        'card': '12px',
        'section': '16px',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'lime-glow': '0 0 25px -5px rgba(184, 227, 75, 0.25)',
        'card-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
