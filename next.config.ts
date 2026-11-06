import { readdirSync } from "node:fs";
import type { NextConfig } from "next";

// `/` shows the brand named by BRAND, or the first brand folder in dev.
const brand =
  process.env.BRAND ??
  readdirSync("brands", { withFileTypes: true }).find((entry) => entry.isDirectory())?.name;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return brand ? [{ source: "/", destination: `/${brand}` }] : [];
  },
};

export default nextConfig;
