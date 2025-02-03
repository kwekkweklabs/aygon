import { heroui } from "@heroui/react";
import defaultTheme from "tailwindcss/defaultTheme";

const COLORS = {
  primary: {
    DEFAULT: "#FFEB00",
    50: "#FFFDE5",
    100: "#FFFBCC",
    200: "#FFF799",
    300: "#FFF266",
    400: "#FFEE33",
    500: "#FFEB00",
    600: "#CCBB00",
    700: "#998C00",
    800: "#665E00",
    900: "#332F00",
    950: "#191700",
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
    DEFAULT: "#404040",
    50: "#737373",
    100: "#6E6E6E",
    200: "#616161",
    300: "#575757",
    400: "#4A4A4A",
    500: "#404040",
    600: "#333333",
    700: "#292929",
    800: "#1C1C1C",
    900: "#121212",
    950: "#0D0D0D",
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
