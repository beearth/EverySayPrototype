/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],                           // ← 이 줄이 핵심
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        border: "hsl(var(--border))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
