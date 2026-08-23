/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      colors: {
        palantir: {
          canvas: '#111418',
          nav: '#182026',
          card: '#202B33',
          border: '#293742',
          borderLight: '#30404D',
          textPrimary: '#F5F8FA',
          textSecondary: '#A7B6C2',
          textMuted: '#5C7080',
          action: '#106BA3',
          actionHover: '#0E5A8A',
          pass: '#0D8050',
          passLight: 'rgba(13, 128, 80, 0.2)',
          warn: '#D9822B',
          warnLight: 'rgba(217, 130, 43, 0.2)',
          danger: '#C23030',
          dangerLight: 'rgba(194, 48, 48, 0.2)',
          cobalt: '#2B95D6',
        }
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '5px',
      }
    },
  },
  plugins: [],
}