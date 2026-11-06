import { defineBrand } from "@/lib/brand/schema";
import strategy from "./work/strategy";

// A fictional studio, kept as the generator's test brand: work/ holds the full
// run (brief, strategy, three routes, scores) that produced Edition 2 from route B.
export default defineBrand({
  ...strategy,
  slug: "okonkwo",
  name: "Okonkwo-Marchetti Architectural Lighting Studio",
  edition: "Brand guidelines · Edition 2 · November 2026",
  positioning:
    "We design the light in buildings people remember at night: lobbies, stairwells, bridges, and the long walk home.",
  story: {
    audience:
      "Architects and developers who already have the building and need the hours after sunset to be as considered as the hours before. Planning committees and the public see the work afterward, mostly at night and in photographs.",
    personality: ["Warm", "Exacting", "Nocturnal", "Generous"],
    refuses: "Spectacle: facades that change color every few seconds. Spec sheets with a logo on them. Darkness treated as a failure.",
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
      use: "The surnames in capitals, joined by a beam of light. First choice wherever it fits.",
      cites: ["equity.assets.names", "concept.primitives.cone", "concept.primitives.cut-off"],
    },
    symbol: {
      file: "symbol.svg",
      name: "Lamp",
      use: "A fitting and its beam. App icons, favicons, site signage.",
      cites: ["concept.primitives.cone", "concept.primitives.cut-off"],
    },
    alternates: [
      {
        file: "lockup.svg",
        name: "Lockup",
        use: "Lamp, wordmark and descriptor. Covers, hoardings, competition boards.",
        cites: ["equity.assets.descriptor", "concept.primitives.cone"],
      },
    ],
    clearSpace: { ratio: 0.5, basis: "half the cap height" },
    minimumSize: { screen: "Wordmark 16 px tall, lamp 16 px", print: "Wordmark 5 mm tall" },
  },
  colors: [
    {
      name: "Night",
      role: "ground",
      proportion: 56,
      hex: "#18120F",
      oklch: "oklch(19% 0.012 50)",
      use: "The page: a warm, brown-black night, never a pure black.",
      pairs: [{ on: "Sodium", as: "text" }],
      cites: ["concept.primitives.dusk-pair", "category.conventions.dark-and-glow"],
    },
    {
      name: "Stone",
      role: "ink",
      proportion: 16,
      hex: "#ECE3D6",
      oklch: "oklch(92% 0.02 78)",
      use: "Type on Night.",
      pairs: [{ on: "Night", as: "text" }],
      cites: ["equity.assets.dusk-pair"],
    },
    {
      name: "Sodium",
      role: "accent",
      proportion: 28,
      hex: "#FF5A1F",
      oklch: "oklch(68.24% 0.211 37.70)",
      pantone: "Orange 021 C",
      use: "Flat fields cut with hard edges: a quarter of every layout, never a gradient or a glow.",
      pairs: [{ on: "Night", as: "text" }],
      cites: ["equity.assets.sodium", "concept.primitives.cut-off", "category.conventions.color-change"],
    },
  ],
  type: {
    display: {
      library: "big-shoulders",
      family: "Big Shoulders",
      role: "Headlines and the wordmark, in capitals: street signage after dark.",
      weights: [800],
      cites: ["concept.source"],
    },
    text: {
      library: "chivo",
      family: "Chivo",
      role: "Reading text, labels and figures.",
      weights: [400, 500],
      cites: ["equity.assets.voice"],
    },
    scale: {
      steps: [
        { id: "display", face: "display", size: 160, mobileSize: 64, lineHeight: 0.88, weight: 800, tracking: 0.01, case: "upper", use: "Covers and openers." },
        { id: "title", face: "display", size: 72, mobileSize: 36, lineHeight: 0.92, weight: 800, tracking: 0.01, case: "upper", use: "Project names." },
        { id: "body", face: "text", size: 17, lineHeight: 1.5, weight: 400, tracking: 0, case: "sentence", use: "Everything people read." },
        { id: "figure", face: "text", size: 15, lineHeight: 1.4, weight: 500, tracking: 0, case: "as-written", features: ["tnum"], use: "Lux, kelvin and fixture counts." },
        { id: "label", face: "text", size: 12, lineHeight: 1.3, weight: 500, tracking: 0.14, case: "upper", use: "Descriptor and labels." },
      ],
      cites: ["concept.source", "concept.primitives.cut-off"],
    },
    rules: [
      "Display type in capitals only; reading text in sentence case.",
      "Sodium fields have hard edges and stop at a horizontal line, like a cut-off.",
      "Units written out with a space: 2700 K.",
    ],
    wordmark: {
      library: "big-shoulders",
      family: "Big Shoulders",
      setting: "opsz 72, wght 800",
      changes: [
        "Tracking +0.012 em",
        "Hyphen redrawn as a beam: a trapezoid 0.6 cap tall, 0.1 cap wide at its cut-off top, 0.36 cap at its foot",
      ],
      cites: ["concept.primitives.cone", "concept.primitives.cut-off"],
    },
  },
  reveal: { mark: "primary", compactMark: "symbol.svg", ground: "Sodium", ink: "Night" },
});
