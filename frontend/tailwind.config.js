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
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          hover: 'var(--surface-hover)',
          elevated: 'var(--surface-elevated)',
          panel: 'var(--surface)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        primary: {
          DEFAULT: '#0F62FE',
          hover: '#0043CE',
          pressed: '#002D9C',
          subtle: 'var(--primary-subtle)',
        },
        accent: {
          DEFAULT: '#0F62FE',
          hover: '#0043CE',
          subtle: 'var(--primary-subtle)',
        },
        success: {
          DEFAULT: '#24A148',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: '#F1C21B',
          subtle: 'var(--warning-subtle)',
        },
        danger: {
          DEFAULT: '#DA1E28',
          subtle: 'var(--danger-subtle)',
        },
        info: {
          DEFAULT: '#0F62FE',
          subtle: 'var(--primary-subtle)',
        },
        code: {
          DEFAULT: 'var(--code-bg)',
          text: 'var(--text)',
        }
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '14px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}