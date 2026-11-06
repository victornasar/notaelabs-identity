import { defineBrand } from "@/lib/brand/schema";

export default defineBrand({
  slug: "notae",
  name: "Notae Labs",
  edition: "Identity guidelines · Edition 1 · 2026",
  positioning:
    "Notae Labs turns a founder’s brief into a living brand site the team can use without us in the room.",
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
    },
    symbol: {
      file: "symbol.svg",
      name: "Symbol",
      use: "A registration mark. Avatars, favicons, and small spaces.",
    },
    alternates: [
      { file: "lockup.svg", name: "Lockup", use: "Symbol, then name. Covers and signage." },
      { file: "short.svg", name: "Short wordmark", use: "Where the full name will not fit." },
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
    },
    {
      name: "Ink",
      role: "ink",
      proportion: 22,
      hex: "#171614",
      cmyk: "0 0 0 100 · fields 30 20 20 100",
      use: "Text, rules, and every mark.",
    },
    {
      name: "Graphite",
      role: "support",
      proportion: 5,
      hex: "#3F3C37",
      cmyk: "0 0 0 70",
      use: "Secondary text, on paper only.",
    },
    {
      name: "Signal",
      role: "accent",
      proportion: 3,
      hex: "#2046D6",
      cmyk: "90 65 0 0",
      use: "One decision per view: the current section, a link, focus.",
    },
  ],
  type: {
    display: {
      family: "Source Serif 4",
      role: "Statements, titles, and anything said out loud.",
      source: "Google Fonts · OFL",
    },
    text: {
      family: "IBM Plex Sans",
      role: "Interface, rules, captions, and long reading.",
      source: "Google Fonts · OFL",
    },
  },
  reveal: { mark: "primary", ground: "Ink", ink: "Paper" },
});
