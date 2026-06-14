/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#EEF4FB",
          100: "#D4E5F5",
          200: "#A9CBE9",
          400: "#5A9FD4",
          600: "#1A3C5E",
          700: "#122B45",
          800: "#0C1E30",
        },
        accent: {
          400: "#F5A623",
          500: "#E8941A",
          600: "#C97A10",
        },
        success: "#2ECC71",
        danger:  "#E74C3C",
        warning: "#F39C12",
        neutral: {
          50:  "#F8F9FA",
          100: "#F1F3F5",
          200: "#E9ECEF",
          300: "#DEE2E6",
          400: "#CED4DA",
          500: "#ADB5BD",
          600: "#6C757D",
          700: "#495057",
          800: "#343A40",
          900: "#212529",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
