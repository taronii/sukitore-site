/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A192F', // ダークネイビー
          light: '#172A46',
          dark: '#050D1A',
        },
        secondary: {
          DEFAULT: '#D4AF37', // ゴールド
          light: '#E5C158',
          dark: '#B39020',
        },
        accent: {
          DEFAULT: '#1E90FF', // 青系アクセント
          light: '#4BA9FF',
          dark: '#0066CC',
        },
        background: {
          DEFAULT: '#0F1624', // ダークモード背景
          light: '#1A2233',
          dark: '#080D15',
        },
        textLight: '#F8F9FA',
        textDark: '#A0AEC0',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
        serif: ['Noto Serif JP', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
