import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zd: {
          bg: 'var(--zd-bg)',
          surface: 'var(--zd-surface)',
          'surface-hover': 'var(--zd-surface-hover)',
          border: 'var(--zd-border)',
          'border-hover': 'var(--zd-border-hover)',
          text: 'var(--zd-text)',
          'text-secondary': 'var(--zd-text-secondary)',
          'text-muted': 'var(--zd-text-muted)',
          accent: 'var(--zd-accent)',
          'accent-hover': 'var(--zd-accent-hover)',
          'button-bg': 'var(--zd-button-bg)',
          'button-bg-hover': 'var(--zd-button-bg-hover)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
