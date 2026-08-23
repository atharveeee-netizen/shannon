/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          hover: 'var(--surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-bg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-bg)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle: 'var(--danger-bg)',
        },
        code: 'var(--code-bg)',
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '3px',
        lg: '4px',
      },
    },
  },
  plugins: [],
}