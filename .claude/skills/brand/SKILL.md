---
name: brand
description: Run or resume the brand identity generator for brands/<slug>, one approval gate at a time.
argument-hint: <slug>
disable-model-invocation: true
---

# /brand <slug>

Generates a brand identity in five gates. Each gate ends with the user's approval, given in chat. Every result is a committed file in `brands/<slug>/work/`, so any session (Claude Code or Cursor) can pick up where the last one stopped.

| Gate | File | Done when |
|---|---|---|
| 1. Interview | `work/brief.md` | frontmatter `status: approved` |
| 2. Strategy | `work/strategy.md` + `work/strategy.ts` | `strategy.md` frontmatter `status: approved` |
| 3. Routes | `work/routes/a/`, `b/`, `c/` + `work/scores.md` | all three pass `pnpm check-route <slug>`, scored, shown on `/routes/<slug>` |
| 4. Pick | `work/scores.md` frontmatter `picked:` | the user names a route and its changes |
| 5. Build-out | `brands/<slug>/brand.ts`, `fonts.ts`, `marks/` | `BRAND=<slug> pnpm build` passes |

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

Turn the picked route into the brand: `brand.ts` spreads `strategy.ts` (`...strategy`) and takes the route's marks, colors and type; `fonts.ts` loads the faces from `fonts/<id>/` with `next/font/local` (see the README's "Add a brand"); copy the route's marks into `marks/`. Story and voice come from the brief. Leave the earlier `brand.ts` choices in git history, not in comments. Run `BRAND=<slug> pnpm build` and `pnpm lint`, then show the guidelines page.
