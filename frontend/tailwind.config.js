// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter','ui-sans-serif','system-ui','sans-serif'],
        display: ['Plus Jakarta Sans','Inter','ui-sans-serif','system-ui','sans-serif'],
      },
      colors: {
        brand: { 600: '#7c3aed', 700: '#6d28d9' }
      },
      boxShadow: { card: '0 8px 24px rgba(0,0,0,0.06)' }
    }
  },
  plugins: [],
};
