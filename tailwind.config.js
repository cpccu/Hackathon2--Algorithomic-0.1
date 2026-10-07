/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB", // Primary Blue
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          navy: "#0F172A", // Dark Navy
          navyLight: "#1E293B",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC", // Very light neutral background
          muted: "#F1F5F9",
          border: "#E2E8F0",
        },
        semantic: {
          success: {
            DEFAULT: "#16A34A",
            bg: "#DCFCE7",
            text: "#15803D",
          },
          warning: {
            DEFAULT: "#D97706",
            bg: "#FEF3C7",
            text: "#B45309",
          },
          error: {
            DEFAULT: "#DC2626",
            bg: "#FEE2E2",
            text: "#B91C1C",
          },
          info: {
            DEFAULT: "#0284C7",
            bg: "#E0F2FE",
            text: "#0369A1",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
