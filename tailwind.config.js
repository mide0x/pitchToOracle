/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
         serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
         gold: {
           100: '#F9F1D8',
           400: '#D4AF37',
         },
         cream: '#F5F0E6',
      }
    },
  },
  plugins: [],
}
