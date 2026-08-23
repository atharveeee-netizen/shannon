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
        silicon: {
          canvas: '#0A0D12',
          nav: '#0D1117',
          card: '#13171F',
          cardElevated: '#161B22',
          border: '#21262D',
          borderLight: '#30363D',
          textPrimary: '#F0F6FC',
          textSecondary: '#8B949E',
          textMuted: '#484F58',
          cyan: '#00F2FE',
          cyanGlow: '#0EA5E9',
          emerald: '#00FFA3',
          emeraldDark: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
        },
        palantir: {
          canvas: '#0A0D12',
          nav: '#0D1117',
          card: '#13171F',
          border: '#21262D',
          borderLight: '#30363D',
          textPrimary: '#F0F6FC',
          textSecondary: '#8B949E',
          textMuted: '#484F58',
          action: '#0284C7',
          actionHover: '#0369A1',
          pass: '#10B981',
          passLight: 'rgba(16, 185, 129, 0.15)',
          warn: '#F59E0B',
          warnLight: 'rgba(245, 158, 11, 0.15)',
          danger: '#EF4444',
          dangerLight: 'rgba(239, 68, 68, 0.15)',
          cobalt: '#38BDF8',
        }
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(0, 242, 254, 0.25)',
        'glow-emerald': '0 0 20px -5px rgba(0, 255, 163, 0.25)',
      }
    },
  },
  plugins: [],
}