/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        cream: '#FAF3E0',
        gold: '#F0C808',
      },
      colors: {
        gold: '#F0C808',
        primary: '#131719',
        secondary: '#F3F3F3',
        fourth: '#D0D1D1',
        brand: '#134D2E',
        stroke: '#E7E8E8',
        tertiary: '#A1A2A3',
        alert: '#F64F4F',
      },
      fontSize: {
        '3.5xl': '2rem', //32px
      },
      spacing: {
        3.725: '0.9375rem', //15px
      },
      width: {
        25: '6.25rem', // 100px
        25.5: '6.375rem', // 102px
      },
      height: {
        25: '6.25rem', // 100px
      },
      hoverBackgroundColor: {
        'gold-dark': '#DAB307',
      },
      animation: {
        progress: 'progress 1s infinite linear',
      },
      fontFamily: {
        sans: ['HKGrotesk', 'sans-serif'],
      },
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(0) scaleX(0)' },
          '40%': { transform: 'translateX(0) scaleX(0.4)' },
          '100%': { transform: 'translateX(100%) scaleX(0.5)' },
        },
      },
      transformOrigin: {
        'left-right': '0% 100%',
      }
    },
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
}
