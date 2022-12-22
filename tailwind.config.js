/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'linkedin-blue': '#0077B5',
        'twitter-blue': '#1DA1F2',
        'github-purple': '#7041BF',
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}
