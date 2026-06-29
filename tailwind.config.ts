import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "Yu Gothic UI",
          "Yu Gothic",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Meiryo",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "ui-sans-serif",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 28px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
