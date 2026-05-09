import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: "#0D6B63",
          ink: "#0F1E32",
          mint: "#E6F6F1",
          amber: "#F4B247",
        },
        surface: {
          base: "#FBFEFA",
          elevated: "#FFFFFF",
          overlay: "#E6F6F1",
        },
        semantic: {
          success: "#0D6B63",
          alert: "#B45309",
          warning: "#F4B247",
          info: "#3B82F6",
        },
        content: {
          primary: "#0F1E32",
          secondary: "#536173",
        }
      }
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
};

export default config;
