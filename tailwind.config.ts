import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0B',
          900: '#0B0B0B',
          800: '#141413',
          700: '#1C1B19',
          600: '#26241F',
          500: '#2A2823'
        },
        cream: {
          DEFAULT: '#F2EDE4',
          100: '#F2EDE4',
          200: '#E8E1D4',
          300: '#C9C0AE'
        },
        ash: {
          DEFAULT: '#8B857A',
          400: '#8B857A',
          500: '#6E6A60'
        },
        copper: {
          DEFAULT: '#B45309',
          400: '#D97706',
          500: '#B45309',
          600: '#92400E',
          glow: '#F59E0B'
        }
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace']
      },
      letterSpacing: {
        tightest: '-0.04em',
        ticker: '0.2em'
      },
      animation: {
        'rise-in': 'rise-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 1.4s ease both',
        'pan-slow': 'pan-slow 18s linear infinite',
        ticker: 'ticker 60s linear infinite'
      },
      keyframes: {
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'pan-slow': {
          '0%': { transform: 'scale(1.08) translate(0,0)' },
          '50%': { transform: 'scale(1.12) translate(-2%, -1%)' },
          '100%': { transform: 'scale(1.08) translate(0,0)' }
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    }
  },
  plugins: []
};

export default config;
