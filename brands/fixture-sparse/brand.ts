import { defineBrand } from "@/lib/brand/schema";

// A test brand, not a client. Deliberately sparse and awkward, so the shell is
// proven against more than Okonkwo: a long name, a wordmark with no symbol or
// lockup, a light ground, four colors, and no device or voice.
export default defineBrand({
  slug: "fixture-sparse",
  name: "Halvorsen Abernathy Nakamura Cartographic and Hydrographic Survey Cooperative",
  edition: "Test brand · not a client",
  positioning: "Charts of coastlines and riverbeds, surveyed by boat and drawn by hand for harbor authorities.",
  story: {
    mission: "We survey water and the land beside it, and draw charts that harbor pilots trust.",
    audience: "Harbor authorities and river trusts.",
    personality: ["Patient", "Precise"],
    refuses: "Decoration on a chart.",
  },
  concept: {
    idea: "A chart is a set of measured lines with nothing between them that wasn't measured.",
    source: "Contour lines on an Admiralty chart.",
    primitives: [{ id: "contour", shape: "A thin line at an even interval", from: "Depth contours" }],
  },
  category: {
    name: "Hydrographic survey",
    competitors: ["Surveyor A", "Surveyor B", "Surveyor C"],
    conventions: [
      { id: "navy-blue", convention: "Navy blue and white", seenIn: [], verdict: "reject", why: "Every survey firm looks like a navy." },
    ],
  },
  equity: { status: "greenfield", assets: [] },
  marks: {
    primary: {
      file: "wordmark.svg",
      name: "Wordmark",
      use: "The three surnames on one line. The only mark.",
      meaning: "The three partners, set plainly, in the order they founded the cooperative.",
      cites: ["concept.idea"],
    },
    clearSpace: { ratio: 1, basis: "the cap height" },
    minimumSize: { screen: "Wordmark 12 px tall", print: "Wordmark 4 mm tall" },
    on: [
      { ground: "Paper", ink: "Slate" },
      { ground: "Slate", ink: "Paper" },
    ],
    misuse: [
      "Never break the name onto two lines.",
      "Never set it in Ochre.",
      "Never add a symbol.",
      "Never outline it.",
    ],
  },
  colors: [
    {
      name: "Paper",
      role: "ground",
      proportion: 60,
      hex: "#F2EEE6",
      cmyk: "C4 M5 Y9 K0",
      use: "The chart's paper.",
      pairs: [{ on: "Slate", as: "text" }],
      cites: ["concept.source"],
    },
    {
      name: "Slate",
      role: "ink",
      proportion: 22,
      hex: "#1F2B33",
      cmyk: "C80 M60 Y48 K60",
      use: "Lines and type.",
      pairs: [{ on: "Paper", as: "text" }],
      cites: ["concept.primitives.contour"],
    },
    {
      name: "Ochre",
      role: "accent",
      proportion: 10,
      hex: "#B9782A",
      cmyk: "C20 M55 Y95 K5",
      pantone: "7563 C",
      use: "Land, and one highlight per page.",
      pairs: [{ on: "Paper", as: "graphic" }],
      cites: ["concept.source"],
    },
    {
      name: "Moss",
      role: "support",
      proportion: 8,
      hex: "#4F6A4C",
      cmyk: "C65 M35 Y70 K25",
      use: "Vegetation on the shore.",
      pairs: [{ on: "Paper", as: "text" }],
      cites: ["concept.source"],
    },
  ],
  type: {
    display: {
      library: "familjen-grotesk",
      family: "Familjen Grotesk",
      role: "Headlines and the wordmark.",
      weights: [600],
      cites: ["concept.idea"],
    },
    text: {
      library: "libre-franklin",
      family: "Libre Franklin",
      role: "Reading text and labels.",
      weights: [400, 500],
      cites: ["concept.idea"],
    },
    scale: {
      steps: [
        { id: "display", face: "display", size: 120, mobileSize: 44, lineHeight: 0.95, weight: 600, tracking: -0.02, case: "sentence", use: "Covers." },
        { id: "title", face: "display", size: 56, mobileSize: 30, lineHeight: 1, weight: 600, tracking: -0.01, case: "title", use: "Survey names." },
        { id: "body", face: "text", size: 17, lineHeight: 1.5, weight: 400, tracking: 0, case: "sentence", use: "Reading text." },
        { id: "label", face: "text", size: 12, lineHeight: 1.3, weight: 500, tracking: 0.08, case: "upper", use: "Labels." },
      ],
      cites: ["concept.primitives.contour"],
    },
    rules: ["Sentence case for headlines.", "Depths in metres, with a space: 12 m."],
    fit: "Familjen Grotesk is narrow enough to keep three surnames on one line; Libre Franklin reads well at chart-label sizes.",
    wordmark: {
      library: "familjen-grotesk",
      family: "Familjen Grotesk",
      setting: "wght 600",
      changes: [],
      cites: ["concept.idea"],
    },
  },
  cover: { mark: "primary" },
  notApplicable: {
    imagery: "Test brand: proves the page without a graphic device.",
    voice: "Test brand: proves the page without voice guidance.",
  },
});
