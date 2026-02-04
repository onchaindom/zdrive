import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Minimal palette inspired by Are.na/Cosmos.so
        zdrive: {
          bg: '#fafafa',
          surface: '#ffffff',
          border: '#e5e5e5',
          'border-hover': '#d4d4d4',
          text: '#171717',
          'text-secondary': '#737373',
          'text-muted': '#a3a3a3',
          accent: '#171717',
          'accent-hover': '#404040',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
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
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
