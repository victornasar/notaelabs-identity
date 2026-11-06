# Notae Labs brand renderer

Turns a client's brand into a guidelines site they can share with their team. Every client is a folder of data and assets. The site is the same house shell, dressed in that client's marks, colors, and type.

## Run

```bash
pnpm install
pnpm dev
```

Open the local address Next prints. `/` shows the first brand. Every brand has its own path, such as `/okonkwo`, and the switcher in the corner flips between them. The switcher only appears in dev.

```bash
BRAND=okonkwo pnpm build
```

A build needs `BRAND`. It includes that one brand and nothing else, so no client's data ships in another client's site. `pnpm lint` runs ESLint.

## Add a brand

Make a folder in `brands/`:

```
brands/<slug>/
  brand.ts      the brand, as data
  fonts.ts      the display and text faces
  fonts/        font files and their licenses
  marks/        single-color SVGs
```

- **`brand.ts`** exports `defineBrand({...})`. The types in `lib/brand/schema.ts` list every field. The build fails if a required piece is missing: color proportions must sum to 100, and there must be a ground and an ink color.
- **`fonts.ts`** loads two local fonts with `next/font/local`, using `--brand-display` and `--brand-text` as their variables. Give each font constant a name unique to the brand, such as `acmeDisplay`, then export them as `display` and `text`. Next names the font family after the constant, and dev loads every brand at once.
- **Marks** are drawn in one color. The shell recolors them, so you do not need reversed versions.

`brands/okonkwo` is the reference brand. Okonkwo-Marchetti Architectural Lighting Studio is invented: it exists to test the generator end to end (its `work/` folder holds a complete run) and to catch anything the shell assumes, such as a very long name.

## Generate a brand

The generator runs from chat. In Claude Code, type `/brand <slug>`; in Cursor, ask it to follow `AGENTS.md`. It works in five gates, each waiting for your approval: interview, strategy, three routes, pick, build-out. Every gate's result is committed in `brands/<slug>/work/`, so any session can resume it. The skills live in `.claude/skills/`.

- `pnpm fonts add <id> <slug>` copies an approved family from `fonts/library.json` into the brand.
- `pnpm oklch "Name=L% C H" ...` turns OKLCH picks into hex and lists every contrast pair.
- `pnpm render-marks <route folder>` renders marks to PNG, with a review sheet.
- `pnpm check-route <slug>` lists everything that sends a route back.
- `pnpm check-brand <slug>` checks the brand against the nine parts of a complete brand book and lists what each part lacks.
- `/routes/<slug>` (dev only) shows the three routes side by side. Run `pnpm brands` after adding a route.

## How it works

- `scripts/brands.mjs` writes `brands/registry.generated.ts` before `dev` and `build`. In dev it includes every brand. With `--production` it includes only `BRAND`. The file is not committed.
- `app/[brand]/` renders one long page. `next.config.ts` serves the selected brand at `/`.
- `components/shell/` holds the sections. Brand colors arrive as CSS variables by role: `--ground`, `--ink`, `--accent`, and `--support`.
- `lib/brand/color.ts` works out OKLCH, RGB, and WCAG contrast from each hex value, so contrast figures cannot go stale.

## Status

Built so far: the opening Reveal and the Color section.

Still to build: Story, Voice, Logo, Type, Applications, and Downloads. Downloads will generate PNGs, favicons, a zip of every file, `brand.css`, `tokens.json`, and a `BRAND.md` for agents. After that come private hosted links for each client.

`public/marks/` and `scripts/build-marks.mjs` belong to the old Notae-only site. They stay until the Downloads pipeline replaces them.

## License

All rights reserved. The repository is public to read. It is not licensed for reuse.

The fonts in `brands/*/fonts/` and `lib/fonts/` are under the SIL Open Font License. Each license file sits beside its font.
