import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      textColor: {
        main: "var(--text-color)",
      },
      backgroundColor: {
        main: "var(--bg-color)",
      },
      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        accent: "var(--accent-color)"
      }
    },
  },
  plugins: [],
}
export default config
