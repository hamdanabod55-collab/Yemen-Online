/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E31B23",
        secondary: "#FFB800",
        dark: {
          DEFAULT: "#121212",
          surface: "#1E1E1E",
          elevated: "#2D2D2D"
        }
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
