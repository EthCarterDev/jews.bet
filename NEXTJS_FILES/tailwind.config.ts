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
        gold: '#d4af37',
        emerald: '#1dbd85',
        background: '#050608',
        card: '#0a0a0a',
        border: '#1a1a1a',
      },
    },
  },
  plugins: [],
};
export default config;
