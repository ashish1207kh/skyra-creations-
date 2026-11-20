/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Haute Couture Palette from design spec
        "primary": "#d7ff74",
        "primary-container": "#b8e34b",
        "primary-fixed": "#c6f258",
        "primary-fixed-dim": "#abd53e",
        "on-primary": "#273500",
        "on-primary-container": "#4b6300",
        "on-primary-fixed": "#151f00",
        "on-primary-fixed-variant": "#3a4d00",

        "surface": "#121416",
        "surface-dim": "#121416",
        "surface-bright": "#37393b",
        "surface-variant": "#333537",
        "surface-container-lowest": "#0c0e10",
        "surface-container-low": "#1a1c1e",
        "surface-container": "#1e2022",
        "surface-container-high": "#282a2c",
        "surface-container-highest": "#333537",
        "on-surface": "#e2e2e5",
        "on-surface-variant": "#c4c9b1",

        "secondary": "#c5c7c2",
        "secondary-container": "#444844",
        "secondary-fixed": "#e1e3dd",
        "secondary-fixed-dim": "#c5c7c2",
        "on-secondary": "#2e312d",
        "on-secondary-container": "#b3b6b0",

        "tertiary": "#ebf4d2",
        "tertiary-container": "#cfd8b7",
        "tertiary-fixed": "#dde6c5",
        "tertiary-fixed-dim": "#c1caaa",
        "on-tertiary": "#2c331c",
        "on-tertiary-container": "#565f44",
        "on-tertiary-fixed": "#171e09",

        "outline": "#8e937d",
        "outline-variant": "#444936",

        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",

        // Charcoal & Lime aliases for backward compatibility
        charcoal: {
          dark: '#101213',
          DEFAULT: '#121416',
          card: '#1e2022',
          surface: '#282a2c',
          border: '#333537',
          muted: '#c4c9b1',
          text: '#121416',
        },
        lime: {
          accent: '#d7ff74',
          soft: '#ebf4d2',
          DEFAULT: '#d7ff74',
        },
        ivory: {
          DEFAULT: '#e2e2e5',
          muted: '#c4c9b1',
        },
        status: {
          success: '#22C55E',
          pending: '#F59E0B',
          rejected: '#ffb4ab',
          info: '#3B82F6',
        }
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "margin-mobile": "1.25rem",
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "headline-sm": ["Playfair Display", "serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        "display-xl": ["Playfair Display", "serif"],
        "display-xl-mobile": ["Playfair Display", "serif"],
        "body-lg": ["Manrope", "sans-serif"],
        "body-md": ["Manrope", "sans-serif"],
        "body-sm": ["Manrope", "sans-serif"],
        "label-md": ["Manrope", "sans-serif"],
        "label-caps": ["Manrope", "sans-serif"],
        "data-mono": ["Manrope", "monospace"],
        "subheading": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        'input': '0.5rem',
        'btn': '9999px',
        'card': '0.75rem',
        'section': '1rem',
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'lime-glow': '0 0 25px -5px rgba(215, 255, 116, 0.35)',
      }
    },
  },
  plugins: [],
}
