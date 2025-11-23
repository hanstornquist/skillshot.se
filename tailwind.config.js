/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "selector",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        skillshot: {
          DEFAULT: "#f05a28",
          hover: "#d04a18",
          active: "#b03a08",
        },
      },
    },
  },
  plugins: [],
};
