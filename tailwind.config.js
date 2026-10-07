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
        /* ── Legacy token aliases (WeatherAlerts) ─── */
        bgMain: 'var(--bg-main)',
        bgSidebar: 'var(--bg-sidebar)',
        bgSurface: 'var(--bg-surface)',
        bgElevated: 'var(--bg-elevated)',
        borderSubtle: 'var(--border-subtle)',
        borderDefault: 'var(--border-default)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        accentPrimary: 'var(--accent-primary)',
        accentSecondary: 'var(--accent-secondary)',
        accentGold: 'var(--accent-sun)',
        accentSun: 'var(--accent-sun)',
        accentRain: 'var(--accent-rain)',
        accentFog: 'var(--accent-fog)',
        accentNight: 'var(--accent-night)',
        accentAlert: 'var(--accent-alert)',

        /* ── New canonical Calm Instrument aliases ── */
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        surface: 'var(--bg-surface)',
        'surface-elevated': 'var(--bg-elevated)',
        border: 'var(--border-subtle)',
        'border-strong': 'var(--border-default)',

        /* accent shorthands */
        'accent-base': 'var(--accent-primary)',
        'accent-sun': 'var(--accent-sun)',
        'accent-rain': 'var(--accent-rain)',
        'accent-fog': 'var(--accent-fog)',
        'accent-night': 'var(--accent-night)',
        'accent-alert': 'var(--accent-alert)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};