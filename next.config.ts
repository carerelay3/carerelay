import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = process.env.ANALYZE === "true";
const withAnalyzer = withBundleAnalyzer({ enabled: analyze });

const nextConfig: NextConfig = {
  experimental: {
    taint: true,
  },
};

export default withAnalyzer(nextConfig);
