import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CareRelay",
    short_name: "CareRelay",
    description: "One shared number to keep the whole family on the same page.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#E6F6F1",
    theme_color: "#0D6B63",
    categories: ["health", "productivity", "utilities"],
    icons: [
      {
        src: "/brand/ads/carerelay-social-square.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
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
