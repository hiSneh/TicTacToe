import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#080a12',
        panel: 'rgba(17, 24, 39, 0.68)',
        aqua: '#41f4d3',
        rose: '#ff4fd8',
        gold: '#f9d56e',
      },
      boxShadow: {
        neon: '0 0 32px rgba(65, 244, 211, 0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config;
