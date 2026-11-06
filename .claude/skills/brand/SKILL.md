---
name: brand
description: Run or resume the brand identity generator for brands/<slug>, one approval gate at a time.
argument-hint: <slug>
disable-model-invocation: true
---

# /brand <slug>

Generates a complete brand book in nine gates. Each gate ends with the user's approval, given in chat. Every result is a committed file in `brands/<slug>/work/`, so any session (Claude Code or Cursor) can pick up where the last one stopped.

| Gate | File | Done when |
|---|---|---|
| 1. Interview | `work/brief.md` | frontmatter `status: approved` |
| 2. Strategy | `work/strategy.md` + `work/strategy.ts` | `strategy.md` frontmatter `status: approved` |
| 3. Routes | `work/routes/a/`, `b/`, `c/` + `work/scores.md` | all three pass `pnpm check-route <slug>`, scored, shown on `/routes/<slug>` |
| 4. Pick | `work/scores.md` frontmatter `picked:` | the user names a route and its changes |
| 5. Build-out | `brands/<slug>/brand.ts`, `fonts.ts`, `marks/` | `BRAND=<slug> pnpm build` passes |
| 6. Graphic language | `graphics/` + `brand.ts` `graphicLanguage` | `work/book.md` records the user's approval under `## Graphic language` |
| 7. Photography | `images/` + `images/credits.json` + `brand.ts` `photography` | `work/book.md` records approval under `## Photography` |
| 8. Applications | `brand.ts` `applications` | `work/book.md` records approval under `## Applications` |
| 9. Completeness | none | `pnpm check-brand <slug>` passes |

## Steps

1. **Find the gate.** Read every file in `brands/<slug>/work/`. The current gate is the first row in the table that is not done. If `brands/<slug>/` doesn't exist, create it with an empty `work/` and start at gate 1. If the slug already has a `brand.ts`, it has an earlier identity: the interview must cover what it owns (equity).
2. **Run the gate** (sections below), then **stop**. Present what the gate produced and ask for approval. Never run two gates in one turn. Never write `status: approved` or `picked:` until the user approves in chat; record their words in the file, with the date, under `## Approval`.
3. **Commit** the gate's files when you stop, one small commit per gate or round, so the state survives the session.

## Gate 1: Interview

Use the `brand-interview` skill. It writes rounds of questions into `brief.md` and takes answers either from chat or from the file.

## Gate 2: Strategy

Write `strategy.md` for the user and `strategy.ts` for the code, from the approved brief only. They hold the same decisions.

- **Concept**: one idea in a sentence; the physical or cultural thing it borrows from; 3–6 primitives, each a shape someone could draw from its description ("a 3:1 horizontal bar with one rounded end"), each tied to the idea. Primitives are what every mark and device will be built from, so prefer shapes over moods.
- **Category**: the category name, the brief's three competitors, and the conventions they share. Each convention is named, lists who does it (only what the brief or `research/software-brand-identity-research.md` states; write `seenIn: []` rather than guess), and gets a verdict, reject or keep, with a reason. Reject at least one.
- **Equity**: `greenfield`, `refresh` or `replace`, and each asset of the current identity with keep, evolve or drop. For a refresh, the research's default is to evolve rather than replace (P4).
- **Overrides**: only rules the user lifted in writing (`excluded-font:<id>`, `rejected-font:<id>`, `palette-ban`, `gradient-ban`).

`strategy.ts` exports `defineStrategy({...})` from `@/lib/brand/schema`; ids are kebab-case because routes cite them (`concept.primitives.<id>`). Show the user `strategy.md`, not the code.

## Gate 3: Routes

Three routes, each a full direction from the same strategy, in `work/routes/<a|b|c>/`. Make them differ on purpose: different primitives leading, a different type category (serif, sans, slab, mono), and a different value structure in the palette. State in each route's `idea` what it does that the other two don't.

For each route:

1. **Type.** Choose faces from `fonts/library.json`, `status: approved` only; read each family's `character`, `why` and `caution`. Run `pnpm fonts add <id> <slug>`. The family name is the library's, exactly; a typeface is never invented or renamed.
2. **Palette.** Choose in OKLCH with `pnpm oklch "Name=L% C H" ...`, which prints hex and every contrast pair. Record `oklch` and `hex`, and list each color's `pairs` (every surface it is used on, as text, large or graphic).
3. **Marks.** Use the `wordmark` skill, then the `symbol` skill if the route has one. Both write into `routes/<x>/marks/` from a `build.mjs` that stays in the folder.
4. **`route.ts`.** `defineRoute({...})` from `@/lib/brand/route`. Every color, face, scale and mark `cites` the strategy. The applications (app tile, website hero, business card) use real copy from the brief, not lorem ipsum.
5. **Look.** `pnpm render-marks brands/<slug>/work/routes/<x>`, then read `renders/review.png`. Fill `review` with what you saw at 16px, 64px and as a lockup, and `readable: false` if a mark fills in, breaks up or stops reading as itself. Fix and re-render before moving on.
6. **Gate.** `pnpm check-route <slug> <x>` until it passes. A route that fails is reworked, never shown.

Then use the `brand-score` skill to write `scores.md`. Run `pnpm brands`, start `pnpm dev` if it isn't running, and give the user `/routes/<slug>`. Ask them to pick one route and say what to change.

## Gate 4: Pick

Record the pick in `scores.md` frontmatter (`picked: b`) and the requested changes under `## Approval`. If the changes are more than small adjustments, apply them in the route folder, re-run its gate, and show it again before building.

## Gate 5: Build-out

Turn the picked route into the brand: `brand.ts` spreads `strategy.ts` (`...strategy`) and takes the route's marks, colors and type; `fonts.ts` loads the faces from `fonts/<id>/` with `next/font/local` (see the README's "Add a brand"); copy the route's marks into `marks/`. Story and voice come from the brief. Leave the earlier `brand.ts` choices in git history, not in comments. Run `BRAND=<slug> pnpm build` and `pnpm lint`, then show the guidelines page. Then run `pnpm check-brand <slug>` and show the user which of the nine parts are still missing.

The gates after build-out fill the rest of the brand book. Each records its approval in `work/book.md`, one `##` heading per gate, with the user's words and the date. Story, mission, values and applications come from the brief; if the brief lacks them, run a `brand-interview` round for the missing items first.

## Gate 6: Graphic language

The devices that make the identity more than a logo with colors: patterns, supporting shapes, layout rules. Each is built from the strategy's primitives, never invented beside them.

- Write `brands/<slug>/graphics/build.mjs`, which draws 2–5 single-color SVGs in code. Each takes a construction from a primitive (its proportions, angle or spacing), so the device and the marks share their geometry.
- In `brand.ts`, `graphicLanguage.elements` lists each file with its ground and ink (palette colors), its construction in words someone could redraw from, where it's used, and `cites`. `graphicLanguage.layout` holds 3–6 layout rules: where the accent goes, how fields end, spacing, what never happens.
- Run `pnpm brands` and look at the Graphics section before showing it. A device that reads as something else (a hat, a warning sign, a generic icon) is redrawn first, as a mark would be.

## Gate 7: Photography

How images look, shown with real reference photographs.

- Choose 6–12 reference photographs by hand, from a source whose license allows the use (Unsplash, Pexels, or the client's own). Save them in `brands/<slug>/images/` and record each in `images/credits.json` as `{ file, photographer, source, license }`. They are references, never presented as the client's work.
- In `brand.ts`, `photography` sets the style, subjects, lighting, composition, treatment, cropping and what to avoid, citing the strategy (category conventions kept or rejected often decide it).

## Gate 8: Applications

The identity at work, on the pieces from the brief's applications answer.

- In `brand.ts`, `applications` lists each piece: its kind, why the client needs it, its ground and ink, and its copy, written in the brand's voice. Every application uses only the palette, the type scale, the marks and the graphic language.
- The renderer draws each kind from `components/applications/`. A kind it can't draw yet is built there first, for every brand, not for this one.

## Gate 9: Completeness

Run `pnpm check-brand <slug>` and fix what it lists. A part the brand genuinely doesn't need goes in `notApplicable` with the reason, and the user agrees to it. When it passes, show the finished page.
