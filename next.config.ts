import { existsSync, readdirSync } from "node:fs";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// `/` shows the brand named by BRAND, or the first brand folder in dev.
const brand =
  process.env.BRAND ??
  readdirSync("brands", { withFileTypes: true }).find(
    (entry) => entry.isDirectory() && existsSync(`brands/${entry.name}/brand.ts`),
  )?.name;

export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    cacheComponents: true,
    partialPrefetching: true,
    // Files named `*.dev.tsx` exist only in `next dev`, so the /routes review
    // page never reaches a client build. The build's type check skips them, and
    // skips other brands' unfinished routes in work/.
    pageExtensions: dev ? ["dev.tsx", "dev.ts", "tsx", "ts"] : ["tsx", "ts"],
    typescript: { tsconfigPath: dev ? "tsconfig.json" : "tsconfig.build.json" },
    async rewrites() {
      return brand ? [{ source: "/", destination: `/${brand}` }] : [];
    },
  };
}
