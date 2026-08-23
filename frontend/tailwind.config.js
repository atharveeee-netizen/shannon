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
        bg: '#0B0B0B',
        surface: '#111111',
        card: '#161616',
        border: '#292929',
        borderLight: '#3D3D3D',
        textPrimary: '#F3F3EF',
        textSecondary: '#8A8A84',
        accent: '#106BA3',
        success: '#0D8050',
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