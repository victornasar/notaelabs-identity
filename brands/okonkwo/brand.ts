import { defineBrand } from "@/lib/brand/schema";

// A fictional studio. It exists to break every assumption Notae lets the shell
// get away with: a long hyphenated name, no symbol, a loud palette.
export default defineBrand({
  slug: "okonkwo",
  name: "Okonkwo-Marchetti Architectural Lighting Studio",
  edition: "Brand guidelines · Edition 1 · November 2026",
  positioning:
    "We design the light in buildings people remember at night: lobbies, stairwells, bridges, and the long walk home.",
  concept: {
    idea: "Night is designed, not survived: the warm light that gets people home.",
    source: "Low-pressure sodium streetlights, the orange a city glows at night.",
    primitives: [
      {
        id: "sodium-field",
        shape: "A flat, full-bleed field of streetlight orange with nothing behind it",
        from: "A street lit by sodium lamps, where everything turns one color",
      },
      {
        id: "dusk-pair",
        shape: "Two grounds, pale stone and near-black basalt, swapped as day turns to night",
        from: "The same building before and after sunset",
      },
      {
        id: "one-line-name",
        shape: "Both surnames on one line, joined by the hyphen, set heavy and tight",
        from: "A partnership signed as one name, like a sign over a door",
      },
    ],
  },
  category: {
    name: "Architectural lighting design",
    // Okonkwo-Marchetti is invented, so no claims are made about these firms.
    competitors: ["Speirs Major", "Arup Lighting", "L’Observatoire International"],
    conventions: [
      {
        id: "dark-and-glow",
        convention: "Black pages with glowing photography of lit facades",
        seenIn: [],
        verdict: "reject",
        why: "Darkness shown as a backdrop for spectacle, which is what the studio refuses.",
      },
      {
        id: "spec-sheet",
        convention: "Technical, spec-sheet type and cool neutral palettes",
        seenIn: [],
        verdict: "reject",
        why: "The studio sells warmth with evidence, not a catalog.",
      },
    ],
  },
  equity: {
    status: "greenfield",
    assets: [
      {
        id: "names",
        asset: "The founders’ two surnames",
        verdict: "keep",
        why: "The partnership is the studio.",
      },
    ],
  },
  story: {
    audience:
      "Architects and developers who already have the building and need the hours after sunset to be as considered as the hours before.",
    personality: ["Warm", "Exacting", "Nocturnal", "Generous"],
    refuses: "Uplighting everything. Color-changing LEDs as a personality. Darkness treated as a failure.",
  },
  voice: {
    traits: [
      {
        trait: "Warm",
        means: "We write like we’re standing in the room with you, at dusk.",
        doesNotMean: "Gushing, or adjectives doing the work of evidence.",
      },
      {
        trait: "Exacting",
        means: "Lux levels, color temperatures, and fixture counts, named.",
        doesNotMean: "A spec sheet with a logo on it.",
      },
    ],
    lines: [
      {
        do: "The stair glows at 2700 K so nobody squints on the way down.",
        dont: "Our innovative lighting solutions transform spaces.",
      },
    ],
    rewrites: [
      {
        before: "Okonkwo-Marchetti delivers cutting-edge illumination for premium developments.",
        after: "We light buildings for the people who use them after dark.",
      },
    ],
  },
  marks: {
    primary: {
      file: "wordmark.svg",
      name: "Wordmark",
      use: "The full surname pair on one line. Wherever width allows.",
      cites: ["concept.primitives.one-line-name", "equity.assets.names"],
    },
    alternates: [
      {
        file: "stacked.svg",
        name: "Stacked",
        use: "Square formats: avatars, signage, cards.",
        cites: ["equity.assets.names"],
      },
    ],
    clearSpace: { ratio: 0.5, basis: "half the height of the O" },
    minimumSize: { screen: "Wordmark 20 px tall", print: "Wordmark 6 mm tall" },
  },
  colors: [
    {
      name: "Limestone",
      role: "ground",
      proportion: 48,
      hex: "#EFE8DC",
      cmyk: "6 8 14 0",
      pantone: "7527 C",
      use: "Daylight. The default page.",
      cites: ["concept.primitives.dusk-pair"],
    },
    {
      name: "Basalt",
      role: "ink",
      proportion: 24,
      hex: "#1B1A17",
      cmyk: "60 55 60 85",
      pantone: "Black 7 C",
      use: "Night. Type, and full-bleed evening fields.",
      pairs: [
        { on: "Limestone", as: "text" },
        { on: "Sodium", as: "text" },
        { on: "Filament", as: "text" },
      ],
      cites: ["concept.primitives.dusk-pair"],
    },
    {
      name: "Sodium",
      role: "accent",
      proportion: 16,
      hex: "#FF5A1F",
      cmyk: "0 75 95 0",
      pantone: "Orange 021 C",
      use: "The streetlight. Openings, covers, and one thing per page.",
      cites: ["concept.primitives.sodium-field", "concept.source"],
    },
    {
      name: "Filament",
      role: "support",
      proportion: 7,
      hex: "#F6C445",
      cmyk: "0 22 80 0",
      pantone: "7406 C",
      use: "Highlights on Basalt. Never text on Limestone.",
      pairs: [{ on: "Basalt", as: "text" }],
      cites: ["concept.idea"],
    },
    {
      name: "Mercury",
      role: "support",
      proportion: 5,
      hex: "#2E5E58",
      cmyk: "80 35 55 25",
      pantone: "5477 C",
      use: "Cool counterweight. Diagrams and secondary fields.",
      pairs: [
        { on: "Limestone", as: "text" },
        { on: "Filament", as: "graphic" },
      ],
      cites: ["category.conventions.spec-sheet"],
    },
  ],
  type: {
    display: {
      library: "bricolage-grotesque",
      family: "Bricolage Grotesque",
      role: "Headlines, set tight and heavy.",
      weights: [700],
      cites: ["concept.primitives.one-line-name"],
    },
    text: {
      library: "instrument-sans",
      family: "Instrument Sans",
      role: "Everything people read for longer than a glance.",
      weights: [400, 500],
      cites: ["category.conventions.spec-sheet"],
    },
    scale: {
      steps: [
        { id: "display", face: "display", size: 144, mobileSize: 52, lineHeight: 0.9, weight: 700, tracking: -0.04, case: "sentence", use: "Covers and openers." },
        { id: "title", face: "display", size: 64, mobileSize: 34, lineHeight: 1, weight: 700, tracking: -0.03, case: "sentence", use: "Project names and section titles." },
        { id: "body", face: "text", size: 17, lineHeight: 1.55, weight: 400, tracking: 0, case: "sentence", use: "Everything people read." },
        { id: "figure", face: "text", size: 15, lineHeight: 1.4, weight: 500, tracking: 0, case: "as-written", features: ["tnum"], use: "Lux, kelvin, and fixture counts." },
      ],
      cites: ["concept.primitives.one-line-name", "category.conventions.spec-sheet"],
    },
    rules: [
      "Sentence case for headlines; units always written out with a space: 2700 K.",
      "Headlines tighten as they grow.",
    ],
    wordmark: {
      library: "bricolage-grotesque",
      family: "Bricolage Grotesque",
      setting: "Not recorded",
      changes: [],
      cites: ["concept.primitives.one-line-name"],
    },
  },
  reveal: { mark: "primary", compactMark: "stacked.svg", ground: "Sodium", ink: "Basalt" },
});
