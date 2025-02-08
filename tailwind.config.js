import { heroui } from "@heroui/react";
import defaultTheme from "tailwindcss/defaultTheme";

const COLORS = {
  primary: {
    DEFAULT: "#CAF822",
    50: "#FAFEEB",
    100: "#F4FED2",
    200: "#EAFCA6",
    300: "#DFFB79",
    400: "#D4F94D",
    500: "#CAF822",
    600: "#ACDA07",
    700: "#81A305",
    800: "#566D03",
    900: "#2B3602",
    950: "#171E01",
  },
  secondary: {
    DEFAULT: "#344CB7",
    50: "#EBEEF9",
    100: "#D3D9F3",
    200: "#A8B3E6",
    300: "#8091DB",
    400: "#546BCE",
    500: "#344CB7",
    600: "#2A3D93",
    700: "#202E6F",
    800: "#141E47",
    900: "#0A0F24",
    950: "#060814",
  },
  tertiary: {
    DEFAULT: "#52733A",
    50: "#9ABF80",
    100: "#91B974",
    200: "#81AF60",
    300: "#719F50",
    400: "#638B46",
    500: "#52733A",
    600: "#435F30",
    700: "#354B26",
    800: "#27361B",
    900: "#161F0F",
    950: "#0E140A",
  },
  background: {
    DEFAULT: "#F2F1EC",
    50: "#FDFDFC",
    100: "#FDFDFC",
    200: "#F9F8F6",
    300: "#F7F6F3",
    400: "#F5F4F0",
    500: "#F2F1EC",
    600: "#CBC7B3",
    700: "#A49D7A",
    800: "#706A4D",
    900: "#3A3627",
    950: "#1B1A13",
  },
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...COLORS,
      },
      fontFamily: {
        sans: ["'Inter Variable'", ...defaultTheme.fontFamily.sans],
        jakarta: ["'Plus Jakarta Sans'", "sans-serif"],
        roman: ["'Times New Roman'", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "light",
    }),
  ],
};
