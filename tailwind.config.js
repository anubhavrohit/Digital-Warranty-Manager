/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sunshine: {
          DEFAULT: '#FFC926',
          hover: '#e5b31f',
          light: '#fff9e6',
          dark: '#cda013',
        },
        cream: {
          DEFAULT: '#F3E8CC',
          dark: '#e5d7b5',
          light: '#faf5e8',
          subtle: '#f7efe0',
        },
        carrot: {
          DEFAULT: '#F96015',
          hover: '#d94d07',
          light: '#fff0e8',
        },
        tomato: {
          DEFAULT: '#D52518',
          hover: '#b51c10',
          light: '#fdeae8',
        },
        forest: {
          DEFAULT: '#18542A',
          hover: '#113d1e',
          light: '#e8f3eb',
          muted: '#366d46',
          dark: '#0d3218',
        },
        kiwi: {
          DEFAULT: '#9ABC05',
          hover: '#829f04',
          light: '#f4f9e1',
          dark: '#6a8203',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(24, 84, 42, 0.08), 0 2px 6px -1px rgba(24, 84, 42, 0.04)',
        'warm-hover': '0 12px 28px -4px rgba(24, 84, 42, 0.15), 0 4px 12px -2px rgba(24, 84, 42, 0.08)',
        card: '0 2px 12px rgba(24, 84, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
