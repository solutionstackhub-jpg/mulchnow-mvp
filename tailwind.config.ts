import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mulch: {
          50: "#f6f5f0",
          100: "#e8e6d9",
          200: "#d3cfb6",
          300: "#b9b28c",
          400: "#a49a6b",
          500: "#95895d",
          600: "#806f4e",
          700: "#685840",
          800: "#584a39",
          900: "#4c4134",
        },
        forest: {
          50: "#f0f9f1",
          100: "#dbf0de",
          200: "#b9e1c0",
          300: "#8bcb97",
          400: "#5aaf6a",
          500: "#38934c",
          600: "#28773b",
          700: "#215f31",
          800: "#1d4c2a",
          900: "#1a3f24",
          950: "#0a2313",
        },
        earth: {
          50: "#fdf8f0",
          100: "#f9eddb",
          200: "#f2d8b6",
          300: "#e9bc87",
          400: "#df9956",
          500: "#d88036",
          600: "#c9692c",
          700: "#a75226",
          800: "#864225",
          900: "#6d3821",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
