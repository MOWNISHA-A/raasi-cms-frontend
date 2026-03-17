/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF9933', // Saffron
          dark: '#E68A2E',
        },
        secondary: {
          DEFAULT: '#0A1F44', // Dark Navy Blue
          light: '#1B3666',
        },
        background: '#F3F4F6' // Light Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
