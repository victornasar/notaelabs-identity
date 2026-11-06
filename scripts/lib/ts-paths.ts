/**
 * Lets Node run the app's TypeScript directly: `node --import ./scripts/lib/ts-paths.ts x.ts`.
 * Node strips the types itself; this only resolves `@/` and extensionless imports the way
 * tsconfig.json does.
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);

registerHooks({
  resolve(specifier, context, next) {
    const alias = specifier.startsWith("@/") ? new URL(specifier.slice(2), root) : null;
    const url =
      alias ??
      (/^\.\.?\//.test(specifier) && context.parentURL?.startsWith("file:")
        ? new URL(specifier, context.parentURL)
        : null);
    if (url && !existsSync(fileURLToPath(url))) {
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        const candidate = new URL(url.href + suffix);
        if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context);
      }
    }
    // Relative imports that already resolve go through untouched, so CommonJS requires keep working.
    return next(alias ? alias.href : specifier, context);
  },
});
