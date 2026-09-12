/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#05070f',
          900: '#080c18',
          880: '#0a1020',
          850: '#0c1426',
          800: '#101a30',
          700: '#16233f',
          600: '#1e2e4f',
          500: '#2a3d63',
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: '#34d399',
        },
        cyan: {
          electric: '#22d3ee',
        },
      },
      // Finer-grained alpha steps for the glass surfaces and hairline borders
      opacity: {
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        18: '0.18',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
        glow: '0 0 24px rgba(34, 211, 238, 0.25)',
        'glow-emerald': '0 0 28px rgba(16, 185, 129, 0.28)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: 0.7 },
          '100%': { transform: 'scale(1.6)', opacity: 0 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dash: {
          to: { strokeDashoffset: -1000 },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        dash: 'dash 12s linear infinite',
      },
    },
  },
  plugins: [],
}
