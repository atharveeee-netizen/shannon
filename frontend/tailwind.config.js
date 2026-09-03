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
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          hover: 'var(--surface-hover)',
          panel: 'var(--panel)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        primary: {
          DEFAULT: '#0f62fe',
          hover: '#0353e9',
          pressed: '#002d9c',
          subtle: 'rgba(15, 98, 254, 0.12)',
        },
        accent: {
          DEFAULT: '#0f62fe',
          hover: '#0353e9',
          subtle: 'rgba(15, 98, 254, 0.12)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle: 'var(--danger-subtle)',
        },
        info: {
          DEFAULT: '#0f62fe',
          subtle: 'rgba(15, 98, 254, 0.12)',
        },
        code: {
          DEFAULT: 'var(--code-bg)',
          text: 'var(--code-text)',
        }
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
    },
  },
  plugins: [],
}