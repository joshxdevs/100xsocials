/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-high': 'var(--surface-high)',
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        muted: 'var(--muted)',
        content: 'var(--content)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        'glass-5': 'var(--glass-5)',
        'glass-10': 'var(--glass-10)',
        'glass-20': 'rgba(255, 255, 255, 0.20)',
        'primary-glass': 'var(--primary-glass)',
        'primary-border': 'var(--primary-border)',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease',
        'slide-up': 'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
