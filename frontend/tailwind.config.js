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
        sans: ['"Geist"', '"Plus Jakarta Sans"', '"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Plus Jakarta Sans"', '"Geist"', 'sans-serif'],
      },
      colors: {
        obsidian: {
          canvas: '#070A0F',
          surface: '#0B0F19',
          subsurface: '#111827',
          elevated: '#1F2937',
          border: '#1E293B',
          borderLight: '#26344A',
          borderHighlight: '#334155',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
          textSubtle: '#475569',
          cyan: '#00F0FF',
          laserCyan: '#00F0FF',
          cobalt: '#3B82F6',
          cobaltDark: '#2563EB',
          hyperCobalt: '#2563EB',
          lime: '#10B981',
          acidLime: '#10B981',
          emerald: '#10B981',
          emeraldDark: '#059669',
          amber: '#F59E0B',
          crimson: '#EF4444',
        }
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        xl: '6px',
      },
      boxShadow: {
        'tactile-primary': 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.4)',
        'tactile-surface': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}