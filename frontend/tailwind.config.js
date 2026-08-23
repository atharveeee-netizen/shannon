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
        void: {
          canvas: '#05050A',
          surface: '#080914',
          subsurface: '#0D1122',
          elevated: '#12172C',
          border: '#1A2138',
          borderLight: '#242F50',
        },
        nebula: {
          violet: '#4B1886',
          violetDark: '#2C0E52',
          teal: '#0E3B43',
          tealDark: '#08252B',
          navy: '#0D1122',
        },
        cyber: {
          cyan: '#5CF2E7',
          cyanDark: '#00B4D8',
          pink: '#FF7AC6',
          pinkDark: '#D946EF',
          starlight: '#E6FFFF',
          emerald: '#10B981',
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
      animation: {
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
      },
      boxShadow: {
        'tactile-primary': 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 16px -2px rgba(92, 242, 231, 0.45)',
        'tactile-pink': 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 16px -2px rgba(255, 122, 198, 0.45)',
        'tactile-surface': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}