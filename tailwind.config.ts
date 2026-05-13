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
          purple: "#171326",
          red: "#F23A3A",
          gold: "#C97800",
          rose: "#F7D6D8",
          charcoal: "#111018",
          teal: "#171326",
          ink: "#111018",
          mint: "#F7D6D8",
          amber: "#C97800",
        },
        surface: {
          base: "#FAF7F3",
          elevated: "#FFFFFF",
          overlay: "#F7D6D8",
        },
        semantic: {
          success: "#171326",
          alert: "#F23A3A",
          warning: "#C97800",
          info: "#171326",
        },
        content: {
          primary: "#171326",
          secondary: "#3a3842",
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
