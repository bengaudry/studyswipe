import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    "bg-neutral-500",
    "bg-neutral-500/20",
    "group-data-[selected=true]:border-neutral-500",
    "bg-red-500",
    "bg-red-500/20",
    "group-data-[selected=true]:border-red-500",
    "bg-orange-500",
    "bg-orange-500/20",
    "group-data-[selected=true]:border-orange-500",
    "bg-yellow-500",
    "bg-yellow-500/20",
    "group-data-[selected=true]:border-yellow-500",
    "bg-green-500",
    "bg-green-500/20",
    "group-data-[selected=true]:border-green-500",
    "bg-cyan-500",
    "bg-cyan-500/20",
    "group-data-[selected=true]:border-cyan-500",
    "bg-blue-500",
    "bg-blue-500/20",
    "group-data-[selected=true]:border-blue-500",
    "bg-indigo-500",
    "bg-indigo-500/20",
    "group-data-[selected=true]:border-indigo-500",
    "bg-purple-500",
    "bg-purple-500/20",
    "group-data-[selected=true]:border-purple-500",
    "bg-pink-500",
    "bg-pink-500/20",
    "group-data-[selected=true]:border-pink-500",
  ],
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
