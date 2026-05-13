import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CircleRelay",
    short_name: "CircleRelay",
    description: "One shared line for every circle in your life.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#FAF7F3",
    theme_color: "#171326",
    icons: [
      {
        src: "/brand/icons/circlerelay-app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/icons/circlerelay-app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/brand/icons/circlerelay-app-icon-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icons/circlerelay-app-icon-1024.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
