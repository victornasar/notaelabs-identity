---
name: symbol
description: Build a brand symbol in code from the strategy's primitives, on a grid, and render it for review. Use when a route or brand needs a symbol, app icon mark or monogram.
---

# Symbol

A symbol is built in code from the strategy's primitives, so it can be regenerated, measured and extended into patterns and icons later. It is drawn, not described: the script is the source.

## Steps

1. **Pick the primitives** it uses, from `strategy.ts`. One or two; a symbol carrying every primitive says nothing. Write the symbol's idea in one sentence that names them, and check it against the name and the concept: the symbol should be something only this brand would draw.
2. **Sketch three to five variants** in `build.mjs` before choosing: different arrangements, proportions or crops of the same primitives. Render them all (write each to `marks/` under a scratch name, render, read `review.png`, then delete the losers). Choose by how each reads at 16px and how much of the concept survives.
3. **Build on a grid.** A 24-unit square, with the drawing inside 20 units. Use `shapes.rect`, `shapes.circle`, `shapes.polygon` and path commands from `scripts/lib/outline.ts`, as filled shapes (no strokes), and write with `toSvg(paths)`. A hole is a shape wound the other way (`clockwise: false`).
   At 16px one unit is two-thirds of a pixel, so every bar, gap and counter is at least 2 units, and the important ones 3 or more.
4. **Look.** `pnpm render-marks <route folder>`, read `renders/review.png`. At 16px it must keep its silhouette on light and dark grounds; at 64px its details should reward a look. Check it as the app tile in the route's tile colors.
5. **Record** it in `route.ts` under `marks.symbol` with `cites` naming its primitives, and a lockup in `marks.alternates` if the route uses one (built from the wordmark script's run and this symbol, side by side, with the gap stated in units of the cap height).

## Already taken

Shapes the research found overused in software, so a route only uses one when the strategy argues for it: crosshairs and registration marks, asterisks and sparks, portals and keyholes, aura or blur gradients, and lowercase geometric grotesk letters in a rounded square.
