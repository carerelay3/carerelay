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
        surface: {
          base: "#0F1115",     // Deep charcoal main background
          elevated: "#1A1D24", // Data grids, panels, cards
          overlay: "#262B36",  // Floating command bars, menus
        },
        semantic: {
          success: "#10B981",  // Active, Resolved
          alert: "#EF4444",    // Suspended, Critical
          warning: "#F59E0B",  // Pending, SLA warning
          info: "#3B82F6",     // Neutral telemetry
        },
        content: {
          primary: "#F8FAFC",  // Crisp white for vital data
          secondary: "#94A3B8",// Cool gray for metadata
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