/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#050816",
        secondary: "#aaa6c3",
      },
      screens: {
        xs: "450px",
        short: { 'raw': '(min-height: 500px)' },
      },
    },
  },
  plugins: [],
}

