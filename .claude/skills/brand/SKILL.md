---
name: brand
description: Run or resume the brand identity generator for brands/<slug>, one approval gate at a time.
argument-hint: <slug>
disable-model-invocation: true
---

# /brand <slug>

Generates a brand book (its sections are listed, with what each needs, in `lib/brand/sections.ts`), delivered as a Figma file, in eight gates. Each gate ends with the user's approval, given in chat. Every result is a committed file in `brands/<slug>/work/`, so any session (Claude Code or Cursor) can pick up where the last one stopped.

| Gate | File | Done when |
|---|---|---|
| 1. Interview | `work/brief.md` | frontmatter `status: approved` |
| 2. Strategy | `work/strategy.md` + `work/strategy.ts` | `strategy.md` frontmatter `status: approved` |
| 3. Routes | `work/routes/a/`, `b/`, `c/` + `work/scores.md` | all three pass `pnpm check-route <slug>`, scored, shown on `/routes/<slug>` |
| 4. Pick | `work/scores.md` frontmatter `picked:` | the user names a route and its changes |
| 5. Build-out | `brands/<slug>/brand.ts`, `fonts.ts`, `marks/` | `pnpm check` passes |
| 6. Book copy | `brand.ts` mark meanings, `type.fit`, `voice.signoff`, `page.titles` | `work/book.md` records the user's approval under `## Book copy` |
| 7. Graphic device | `graphics/` + `brand.ts` `device` | `work/book.md` records approval under `## Graphic device` |
| 8. Figma file | `brands/<slug>/figma/` | `pnpm check` passes and the user has built the file with the plugin |

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

Then use the `brand-score` skill to write `scores.md`. Run `pnpm shots <slug>`, which checks the board and saves `.shots/<slug>-routes.png`; look at it. Then start `pnpm dev` if it isn't running, and give the user `/routes/<slug>`. Ask them to pick one route and say what to change.

## Gate 4: Pick

Record the pick in `scores.md` frontmatter (`picked: b`) and the requested changes under `## Approval`. If the changes are more than small adjustments, apply them in the route folder, re-run its gate, and show it again before building.

## Gate 5: Build-out

Turn the picked route into the brand: `brand.ts` spreads `strategy.ts` (`...strategy`) and takes the route's marks, colors and type; `fonts.ts` loads the faces from `fonts/<id>/` with `next/font/local` (see the README's "Add a brand"); copy the route's marks into `marks/`. Story and voice come from the brief. Leave the earlier `brand.ts` choices in git history, not in comments. Run `pnpm check`, look at `.shots/<slug>-desktop.png` and `-phone.png`, then show the user the guidelines page and which sections `pnpm check-brand <slug>` still lists as missing.

The gates after build-out fill the rest of the book. Each records its approval in `work/book.md`, one `##` heading per gate, with the user's words and the date. The intro comes from the brief (positioning and mission); if the brief lacks them, run a `brand-interview` round for the missing items first. Values, audience and competitors stay in `work/`; the book doesn't show them.

## Gate 6: Book copy

The words the book needs beside the marks, each in a few sentences in the brand's voice:

- `marks.primary.meaning`: what the wordmark means. Say what each named change in `type.wordmark.changes` stands for.
- `marks.symbol.meaning`: what the logo mark represents, from `concept.source` and the primitives it is drawn from.
- `type.fit`: why the faces fit: where each comes from, and what it does for this brand.
- `voice.signoff`: the book's last line, on the closing panel. The Voice section shows the first three `voice.lines`.
- `page.titles`: a headline per section in the brand's voice, where the plain default ("Marks", "4 colors") undersells it. Optional.

## Gate 7: Graphic device

One device that works across real life and screens. It is built from the strategy's primitives, never invented beside them.

- Write `brands/<slug>/graphics/build.mjs`, which draws it as one single-color SVG in code, taking its construction from a primitive (proportions, angle or spacing), so the device and the marks share their geometry.
- In `brand.ts`, `device` gives the file, its ground and ink, its construction in words someone could redraw from, where it is used, 2–5 rules, and `cites`.
- `device.applications` lists at least two physical pieces (business card, letterhead, signage, poster) and two digital ones (website, social post, email signature, deck, app icon), chosen from the brief's applications answer. Each has why the client needs it, its ground and ink (a pairing the palette lists) and its copy, in the brand's voice.
- Run `pnpm shots <slug>` and look at the Imagery section in `.shots/` before showing it. A device that reads as something else (a hat, a warning sign, a generic icon) is redrawn first, as a mark would be.

## Gate 8: Figma file

Run `pnpm check` and fix what it lists. Only optional sections (imagery, voice) can be left out: each goes in `notApplicable` with the reason, and the user agrees to it. When it passes, run `pnpm export-figma <slug>`, then ask the user to build the file with the plugin in `figma-plugin/` and save a local copy: that `.fig` is the deliverable. The exporter and plugin are not built yet; say so and stop here until they are.
