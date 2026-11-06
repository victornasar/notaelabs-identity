<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Done means `pnpm check` passes

`pnpm check` is the one gate, and CI runs the same command: route types, TypeScript, ESLint, unit tests, `check-route` and `check-brand` for every brand, then `pnpm shots`. Don't restate its rules in prose or comments; if something keeps going wrong, add a check. After it passes, look at the screenshots in `.shots/`: the checks catch broken layouts, and taste is still a person's call.

Shared code in `components/` and `app/` never names a brand. A test fails on any brand's name, color names, hex values or headlines there; brand words go in `brand.ts`.

## Brand generator

To create or continue a brand identity (`/brand <slug>`, or any work in `brands/<slug>/work/`), follow `.claude/skills/brand/SKILL.md`. It calls the skills beside it: `brand-interview`, `wordmark`, `symbol` and `brand-score`.
