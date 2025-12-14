/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec4899", // Pink-500
        secondary: "#f472b6", // Pink-400
        dark: "#0f172a",    // Slate-900 (Deep background)
        card: "#1e293b",    // Slate-800 (Card background)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}