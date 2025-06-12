/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'newsreader': ['Newsreader', 'serif'],
        'noto': ['"Noto Sans"', 'sans-serif'],
      },
      colors: {
        primary: '#0c7ff2',
        text: '#0d141c',
        secondary: '#49739c',
        background: '#f8fafc', // slate-50
        card: '#e7edf4',
        border: '#cedbe8',
      },
    },
  },
  plugins: [
    // @tailwindcss/line-clamp は Tailwind CSS v3.3+ では不要
  ],
} 