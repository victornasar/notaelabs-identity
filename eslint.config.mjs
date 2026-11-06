import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Built by pnpm build-plugin.
    "figma-plugin/dist/**",
  ]),
  {
    rules: {
      // Marks are the deliverable files. The page has to show those files.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
