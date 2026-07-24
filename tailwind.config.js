/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14171f",
        paper: "#faf8f3",
        accent: "#5b4fff",
        accent2: "#ff6f5e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Fraunces'", "serif"],
      },
    },
  },
  plugins: [],
};
