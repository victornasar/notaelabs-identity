import { defineBrand } from "@/lib/brand/schema";

export default defineBrand({
  slug: "notae",
  name: "Notae Labs",
  edition: "Identity guidelines · Edition 1 · 2026",
  positioning:
    "Notae Labs turns a founder’s brief into a living brand site the team can use without us in the room.",
  // Edition 1 was designed before the decision layer existed. These fields
  // record what it decided, so its choices can be cited; the re-run through
  // `/brand notae` replaces them, and its fonts, which are now rejected.
  concept: {
    idea: "A brand is a set of decisions exact enough that a team can build from them without us in the room.",
    source: "Printers’ registration marks, which line every plate of a print run up to the same point.",
    primitives: [
      {
        id: "registration-mark",
        shape: "A circle crossed by a full vertical and horizontal line, 8/64 stroke, square ends",
        from: "Plates lining up: the brand and the build matching exactly",
      },
      {
        id: "sheet",
        shape: "A warm uncoated sheet carrying one black ink",
        from: "Print: the guidelines as a document a team works from",
      },
      {
        id: "book-serif",
        shape: "A sturdy book serif, set slightly tight",
        from: "The editor’s voice: decisions stated once, plainly",
      },
    ],
  },
  category: {
    name: "Brand guidelines tools and identity studios",
    competitors: ["Frontify", "Corebook", "Brandpad"],
    conventions: [
      {
        id: "saturated-blue",
        convention: "Warm off-white, near-black, and one saturated blue accent",
        seenIn: [],
        verdict: "keep",
        why: "Edition 1 used it for links and focus. The research calls it the most default palette in software; the re-run decides again.",
      },
      {
        id: "hype",
        convention: "Copy that sells mood and mystique instead of stating decisions",
        seenIn: [],
        verdict: "reject",
        why: "The audience implements from the site; adjectives give them nothing to build.",
      },
    ],
  },
  equity: {
    status: "greenfield",
    assets: [
      {
        id: "name",
        asset: "The name Notae Labs (notae: notes, marks)",
        verdict: "keep",
        why: "The name is fixed.",
      },
    ],
  },
  story: {
    audience:
      "A founder whose company already has a product and does not yet have an identity the team can use. One person sits in the meeting. Afterward a designer, an engineer, or an agent implements from the site.",
    personality: ["Exact", "Plain", "Calm"],
    refuses: "Hype. Mystique. Decoration that does not carry a decision.",
  },
  voice: {
    traits: [
      {
        trait: "Exact",
        means: "Numbers, names, and measures instead of adjectives.",
        doesNotMean: "Jargon, or precision for its own sake.",
      },
      {
        trait: "Plain",
        means: "Short words a founder would use out loud.",
        doesNotMean: "Flat, or careless with rhythm.",
      },
      {
        trait: "Calm",
        means: "We state the decision and the reason, once.",
        doesNotMean: "Cold. Warmth shows up as clarity.",
      },
    ],
    lines: [
      {
        do: "Keep clear space equal to the height of the capital N.",
        dont: "Give the logo plenty of room to breathe.",
      },
    ],
    rewrites: [
      {
        before: "We craft bespoke, best-in-class brand experiences that elevate your story.",
        after: "We turn your brief into a brand site your team can build from.",
      },
    ],
  },
  marks: {
    primary: {
      file: "wordmark.svg",
      name: "Wordmark",
      use: "The name, drawn. First choice wherever it fits.",
      cites: ["equity.assets.name", "concept.primitives.book-serif"],
    },
    symbol: {
      file: "symbol.svg",
      name: "Symbol",
      use: "A registration mark. Avatars, favicons, and small spaces.",
      cites: ["concept.primitives.registration-mark"],
    },
    alternates: [
      {
        file: "lockup.svg",
        name: "Lockup",
        use: "Symbol, then name. Covers and signage.",
        cites: ["concept.primitives.registration-mark", "equity.assets.name"],
      },
      {
        file: "short.svg",
        name: "Short wordmark",
        use: "Where the full name will not fit.",
        cites: ["equity.assets.name"],
      },
    ],
    clearSpace: { ratio: 0.93, basis: "the height of the capital N" },
    minimumSize: { screen: "Symbol 16 px, wordmark 32 px tall", print: "Wordmark 8 mm tall" },
  },
  colors: [
    {
      name: "Paper",
      role: "ground",
      proportion: 70,
      hex: "#F6F4EF",
      cmyk: "Uncoated white stock",
      use: "The page. Warm, never tinted.",
      cites: ["concept.primitives.sheet"],
    },
    {
      name: "Ink",
      role: "ink",
      proportion: 22,
      hex: "#171614",
      cmyk: "0 0 0 100 · fields 30 20 20 100",
      use: "Text, rules, and every mark.",
      pairs: [{ on: "Paper", as: "text" }],
      cites: ["concept.primitives.sheet"],
    },
    {
      name: "Graphite",
      role: "support",
      proportion: 5,
      hex: "#3F3C37",
      cmyk: "0 0 0 70",
      use: "Secondary text, on paper only.",
      pairs: [{ on: "Paper", as: "text" }],
      cites: ["concept.primitives.sheet"],
    },
    {
      name: "Signal",
      role: "accent",
      proportion: 3,
      hex: "#2046D6",
      cmyk: "90 65 0 0",
      use: "One decision per view: the current section, a link, focus.",
      pairs: [{ on: "Paper", as: "text" }],
      cites: ["category.conventions.saturated-blue"],
    },
  ],
  type: {
    display: {
      library: "source-serif-4",
      family: "Source Serif 4",
      role: "Statements, titles, and anything said out loud.",
      weights: [400, 500],
      cites: ["concept.primitives.book-serif"],
    },
    text: {
      library: "ibm-plex-sans",
      family: "IBM Plex Sans",
      role: "Interface, rules, captions, and long reading.",
      weights: [400, 500],
      cites: ["concept.idea"],
    },
    scale: {
      steps: [
        { id: "display", face: "display", size: 160, mobileSize: 56, lineHeight: 0.92, weight: 500, tracking: -0.045, case: "sentence", use: "Section openers, one per view." },
        { id: "title", face: "display", size: 72, mobileSize: 36, lineHeight: 1, weight: 500, tracking: -0.035, case: "sentence", use: "Values and names that carry a section." },
        { id: "lead", face: "display", size: 36, mobileSize: 22, lineHeight: 1.15, weight: 500, tracking: -0.015, case: "sentence", use: "The one statement under a title." },
        { id: "body", face: "text", size: 17, lineHeight: 1.5, weight: 400, tracking: 0, case: "sentence", use: "Everything people read." },
        { id: "caption", face: "text", size: 14, lineHeight: 1.4, weight: 400, tracking: 0, case: "sentence", use: "Notes under swatches and figures." },
      ],
      cites: ["concept.primitives.book-serif", "category.conventions.hype"],
    },
    rules: [
      "Sentence case everywhere, including headlines and buttons.",
      "Display sizes tighten as they grow; body text is never tracked.",
    ],
    wordmark: {
      library: "literata",
      family: "Literata",
      setting: "opsz 72, wght 560",
      changes: ["Tracking −0.018 em", "Word space set to 0.34 × the cap height of N"],
      cites: ["equity.assets.name", "concept.primitives.book-serif"],
    },
  },
  reveal: { mark: "primary", ground: "Ink", ink: "Paper" },
});
