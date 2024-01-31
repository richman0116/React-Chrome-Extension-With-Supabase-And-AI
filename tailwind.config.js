/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        'cream': '#FAF3E0',
        'gold': '#F0C808',
      },
      textColor: {
        'gold': '#F0C808',
      },
      width: {
        25.5: '6.375rem', // 102px
      },
      hoverBackgroundColor: {
        'gold-dark': '#DAB307',
      },
      fontFamily: {
        sans: ['Axiforma', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
