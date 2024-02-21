/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        'cream': '#FAF3E0',
        'gold': '#F0C808',
      },
      colors: {
        'gold': '#F0C808',
        'primary': '#131719',
        'secondary': '#F3F3F3',
        'fourth': '#D0D1D1',
        'brand': '#134D2E'
      },
      fontSize: {
        '3.5xl': '2rem', //32px
      },
      spacing: {
        3.725: '0.9375rem', //15px
      },
      width: {
        25.5: '6.375rem', // 102px
      },
      hoverBackgroundColor: {
        'gold-dark': '#DAB307',
      },
      fontFamily: {
        sans: ['HKGrotesk', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
