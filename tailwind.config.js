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
      hoverBackgroundColor: {
        'gold-dark': '#DAB307',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
