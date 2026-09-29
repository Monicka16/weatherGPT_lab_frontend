/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F4F6F2',
        bgSidebar: '#EBF0E9',
        bgSurface: '#FFFFFF',
        bgElevated: '#E4ECE7',
        textPrimary: '#263532',
        textSecondary: '#5F6F6B',
        textMuted: '#7B8985',
        accentPrimary: '#536B67',
        accentSecondary: '#A9C0B5',
        accentGold: '#D6A85F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};