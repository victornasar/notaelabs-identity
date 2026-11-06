/**
 * Builds the Figma plugin into figma-plugin/dist/, which its manifest loads.
 * Figma runs one plain script, so esbuild bundles the plugin with the pure
 * plan it imports from lib/figma.
 *
 *   pnpm build-plugin
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { build } from "esbuild";

const dir = new URL("../figma-plugin/", import.meta.url);
mkdirSync(new URL("dist/", dir), { recursive: true });

await build({
  entryPoints: [new URL("src/code.ts", dir).pathname],
  outfile: new URL("dist/code.js", dir).pathname,
  bundle: true,
  // Figma's sandbox runs older JavaScript than Node does.
  target: "es2017",
  logLevel: "warning",
});
copyFileSync(new URL("src/ui.html", dir), new URL("dist/ui.html", dir));
console.log("Built figma-plugin/dist/.");
