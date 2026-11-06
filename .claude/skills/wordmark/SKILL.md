---
name: wordmark
description: Draw a brand wordmark from a library font's outlines, with named, recorded changes, and render it for review. Use when a route or brand needs a wordmark.
---

# Wordmark

A wordmark starts as the name set in one approved font from `fonts/library.json` and becomes a mark through deliberate, named changes. It is never a typeface of its own: the font it started from is recorded in the route's `type.wordmark` and stays on record in the guidelines.

## Steps

1. **Choose the source font.** An approved family the brand already has in `brands/<slug>/fonts/<id>/` (add it with `pnpm fonts add <id> <slug>`). It need not be the display face, but say why in `type.wordmark.cites`. Try the name in two or three candidates and settings before committing to one; set them side by side in a scratch render.
2. **Write `build.mjs`** in the route folder. Use `scripts/lib/outline.mjs`: `loadFont(path, { wght, opsz, ... })`, `setText(font, name, { size: 1000, tracking })`, then edit `run.glyphs[i].commands` with `moveBy` or `mapPoints`, and write `marks/wordmark.svg` with `toSvg(run)`. Each change is one commented block in the script.
3. **Make the changes.** Each one must come from a primitive or decision in the strategy, and is recorded in `type.wordmark.changes` as a phrase someone could check: "a–e spacing tightened 18 units", "dot of the i replaced by the `seed` primitive, 1.2× stem width". Good sources of change:
   - spacing: overall tracking for the size the mark lives at (wordmarks usually tighten), then pair by pair until the gaps look even, which is optical, not metric;
   - weight and width: an axis setting between named weights, so the mark is its own;
   - one or two letters reshaped where the concept lives: a terminal, a join, a counter, a dot;
   - case and word space, for multi-word names.
   Fewer, stronger changes beat many small ones. A mark with no changes is a font typed out, which the scoring counts against.
4. **Look.** `pnpm render-marks <route folder>` and read `renders/review.png`. At 16px tall the name must still read: hairlines, tight counters and touching letters fill in first. Fix in the script and re-render until it reads. If the full name can't hold at 16px, the route needs a symbol or a short form for small sizes, not a thinner wordmark.
5. **Record** `type.wordmark`: `library`, `family` (exactly as the library), `setting` ("wght 640, opsz 96"), `changes`, `cites`.

Alternates (short form, stacked, lockup with the symbol) come from the same script, so they change when the wordmark does.
