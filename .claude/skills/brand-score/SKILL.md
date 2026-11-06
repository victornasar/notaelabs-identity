---
name: brand-score
description: Score brand routes against the identity rubric and write brands/<slug>/work/scores.md. Use after routes pass check-route, or when asked how a route or brand compares.
---

# Brand score

Scores each route that passes `pnpm check-route` against the rubric below, and writes `brands/<slug>/work/scores.md`, which the `/routes` page shows as each route's score card. Scoring compares the routes for the user. It does not replace looking.

The rubric comes from `research/software-brand-identity-research.md` §6 and §7.5: 29 software identities, mostly by large agencies (Pentagram, Collins, in-house teams at scale). It describes what those projects did, not what any client needs, and independent studios are under-sampled. Say so in every scores.md.

## Rubric

Each criterion is scored 0–3. Evidence names the file, field or render the score rests on.

1. **One idea (C1).** 0: logo, color and type chosen independently. 1: the marks follow the concept. 2: marks and color both derive from named primitives. 3: the primitives would also generate patterns, icons and layouts, and the route shows how.
2. **Named convention (C2).** 0: none rejected. 1: one rejected in words. 2: a rejected convention is visibly absent and its replacement visible. 3: the route only makes sense as an answer to the category.
3. **Type (C3, §7.5.4).** 0: wordmark is the font typed out. 1: spacing and setting only. 2: named outline changes that carry the concept. 3: the wordmark's change recurs elsewhere in the system. Faces come from a free library, so state that the research's top tier (premium retail or custom) is out of reach and score within it.
4. **Equity (C4).** 0: drops what the brief says people are attached to. 1: keeps assets without developing them. 2: evolves the kept assets. 3: the kept assets are the system's strongest parts. Greenfield: score how well the name itself is used.
5. **Small sizes.** 0: fails at 16px. 1: reads at 16px but loses its idea. 2: the symbol or short form keeps its silhouette and idea at 16px and on the app tile. 3: as 2, and the mark was shaped for small sizes rather than surviving them.
6. **Product layer (C5).** 0: brand colors only. 1: the text face works at UI sizes. 2: the palette has room for functional colors (success, warning, error) without clashing, and a mono or UI face where the audience needs one. 3: the route shows a product surface.
7. **Motion (C6).** 0: nothing would move. 1: a motion is possible. 2: the route states one signature motion that comes from a primitive. 3: as 2, and it would also carry loading or state change in the product.
8. **Distinct from the three competitors.** 0: could be mistaken for one. 1: differs in color only. 2: differs in mark and color. 3: differs in idea. Use the brief's descriptions of competitors; where the brief doesn't describe one, write "not described" and score from the others.

## scores.md

The `/routes` page parses this format, so keep its shape:

```markdown
---
picked:
---
# <Name>: route scores

Rubric from research §6 and §7.5; the sample leans toward large agencies, so scores describe agency practice, not client need.

## Route A: <name>

| Criterion | Score | Evidence |
|---|---|---|
| One idea | 2 | ... |
| Named convention | ... | ... |
| Type | ... | ... |
| Equity | ... | ... |
| Small sizes | ... | ... |
| Product layer | ... | ... |
| Motion | ... | ... |
| Distinct | ... | ... |

**Strongest:** one sentence. **Weakest:** one sentence.

## Route B: <name>
...

## Approval
```

Score every criterion for every route; a blank cell is unfinished work. Close with which route scores highest and the one criterion where each route could gain most.
