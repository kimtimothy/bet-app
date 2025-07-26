/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          dark: '#1e40af',
        },
        secondary: {
          DEFAULT: '#dc2626', // red-600
          dark: '#991b1b',
        },
      },
    },
  },
  plugins: [],
};