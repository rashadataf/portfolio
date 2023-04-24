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
      animation: {
        slideIn: "slideIn 1s ease-in forwards"
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100vw)", opacity: 0, },
          "100%": { transform: "translateX(0)", opacity: 1, }
        }
      },
    },
  },
  plugins: [],
  variants: {
    animation: ["motion-safe"]
  }
}

