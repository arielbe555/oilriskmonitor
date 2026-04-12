/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1E',
        surface: '#111827',
        'surface-2': '#1a2332',
        border: '#1e2d3d',
        'border-2': '#2a3f55',
        critical: '#FF2D2D',
        'critical-dim': '#3d0a0a',
        medium: '#FF8C00',
        'medium-dim': '#3d2000',
        low: '#FFD700',
        'low-dim': '#3d3000',
        ok: '#00FF87',
        'ok-dim': '#003d20',
        brand: '#FF6B00',
        'brand-dim': '#3d1800',
        'text-primary': '#E8F0FE',
        'text-secondary': '#8899AA',
        'text-muted': '#445566',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-critical': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateX(-10px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

