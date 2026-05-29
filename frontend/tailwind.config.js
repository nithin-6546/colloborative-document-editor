/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'doc': '0 1px 3px 1px rgba(60,64,67,0.15), 0 1px 2px 0 rgba(60,64,67,0.3)',
      }
    },
  },
  plugins: [],
}
