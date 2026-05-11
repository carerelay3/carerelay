import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareRelay",
    short_name: "CareRelay",
    description: "Family coordination for care updates, tasks, appointments, supplies, and summaries.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#38645f",
    categories: ["health", "productivity", "utilities"],
    icons: [
      {
        src: "/brand/ads/carerelay-social-square.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/logos/carerelay-logo-system.png",
        sizes: "1448x1086",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
