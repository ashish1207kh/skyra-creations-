/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fde7a6',
          300: '#fcd36c',
          400: '#f9b932',
          500: '#f39c12',
          600: '#d77a0b',
          700: '#b1580c',
          800: '#8e4410',
          900: '#753910',
        },
        onyx: {
          900: '#0c0d10',
          850: '#12141a',
          800: '#181b22',
          750: '#20242e',
          700: '#2a2f3c',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
