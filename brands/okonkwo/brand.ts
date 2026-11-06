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
    mission:
      "We light buildings and streets for the people who use them after dark, with as much light as the place needs and no more.",
    vision: "A city where the walk home at night is as good as the walk in daylight.",
    values: [
      { value: "Measured", means: "Every lux level and color temperature has a reason we can say out loud." },
      { value: "Darkness is designed", means: "We decide where light doesn’t go as carefully as where it does." },
      { value: "Warm first", means: "Warm white and sodium tones before anything cooler, and never color for its own sake." },
      { value: "There at switch-on", means: "We commission what we design, on site, the night it’s turned on." },
    ],
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
      {
        do: "The bridge is lit from the handrail, so the river stays dark and the stars stay out.",
        dont: "A stunning illuminated landmark for the city.",
      },
      {
        do: "We’ll be on site the night it’s switched on.",
        dont: "Full project lifecycle support.",
      },
    ],
    signoff: "As much light as the place needs, and no more.",
    rewrites: [
      {
        before: "Okonkwo-Marchetti delivers cutting-edge illumination for premium developments.",
        after: "We light buildings for the people who use them after dark.",
      },
      {
        before: "Our award-winning team delivers bespoke lighting experiences.",
        after: "Six of us, all lighting designers. We’ve lit 40 buildings and 3 bridges.",
      },
    ],
  },
  marks: {
    primary: {
      file: "wordmark.svg",
      name: "Wordmark",
      use: "The surnames in capitals, joined by a beam of light. First choice wherever it fits.",
      meaning:
        "The two partners’ names on one line, because the partnership is the studio. The hyphen between them is redrawn as a beam: narrow where it leaves the fitting, wider where it lands, cut off flat at the top. The names are joined the way the studio joins a lamp to the ground it lights.",
      cites: ["equity.assets.names", "concept.primitives.cone", "concept.primitives.cut-off"],
    },
    symbol: {
      file: "symbol.svg",
      name: "Lamp",
      use: "A fitting and its beam. App icons, favicons, site signage.",
      meaning:
        "A streetlamp seen side on: the fitting, a gap, and the beam it throws, widening at the lamp’s own angle and cut off flat where the light stops. It stands for the one thing the studio does, light falling exactly where it was meant to and nowhere else.",
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
    on: [
      { ground: "Night", ink: "Stone" },
      { ground: "Night", ink: "Sodium" },
      { ground: "Sodium", ink: "Night" },
      { ground: "Stone", ink: "Night" },
    ],
    misuse: [
      "Never replace the beam with a typed hyphen.",
      "Never set “Architectural Lighting Studio” on the wordmark’s line; it sits below or beside, in the label style.",
      "Never put the marks in Stone on Sodium (2.45:1).",
      "Never set the marks over a photograph’s light; place them on a Night or Sodium field cut into the image.",
    ],
  },
  colors: [
    {
      name: "Night",
      role: "ground",
      proportion: 56,
      hex: "#18120F",
      cmyk: "C64 M71 Y59 K100",
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
      cmyk: "C9 M11 Y17 K0",
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
      cmyk: "C0 M77 Y100 K0",
      oklch: "oklch(68.24% 0.211 37.70)",
      pantone: "Orange 021 C",
      use: "Flat fields cut with hard edges: a quarter of every layout, never a gradient or a glow.",
      pairs: [{ on: "Night", as: "text" }],
      cites: ["equity.assets.sodium", "concept.primitives.cut-off", "category.conventions.color-change"],
    },
  ],
  printProfile: "Coated FOGRA39L (VIGC 300), relative colorimetric",
  device: {
    name: "Pool row",
    file: "pool-row.svg",
    ground: "Night",
    ink: "Sodium",
    construction: "3:1 Sodium pools in a row, each one pool-width from the next, running off both edges: a lit street seen from above.",
    use: "The walk home, as a pattern. It runs along the foot of hoardings, the edge of cards, the bottom of the website and the bottom of posts.",
    rules: [
      "Night carries the page. Sodium arrives only as pools, about a quarter of the area, never as a tint, gradient or glow.",
      "Pools repeat at the interval: the gap between two pools is one pool wide. Never closer, never scattered.",
      "The row runs off both edges, so it reads as a street that continues.",
      "Type sits in the dark above the row, never across a pool’s edge.",
    ],
    applications: [
      {
        kind: "signage",
        why: "Hoardings around projects under construction, seen by the public every day.",
        ground: "Night",
        ink: "Stone",
        copy: { headline: "The bridge is lit from the handrail, so the river stays dark.", lines: ["Lighting by Okonkwo-Marchetti", "Switch-on March 2027"] },
      },
      {
        kind: "business-card",
        why: "Handed to architects on site and at reviews.",
        ground: "Night",
        ink: "Stone",
        copy: { name: "Adaeze Okonkwo", role: "Partner, lighting designer", lines: ["adaeze@okonkwo-marchetti.com", "+44 20 7946 0321"] },
      },
      {
        kind: "website",
        why: "The new website, due March 2027 with the bridge competition.",
        ground: "Night",
        ink: "Stone",
        copy: { headline: "We design the light in buildings people remember at night.", lines: ["Work", "Studio", "Contact"] },
      },
      {
        kind: "social-post",
        why: "Announcing a project the night after it is switched on.",
        ground: "Night",
        ink: "Stone",
        copy: { headline: "Switched on last night: the Ashby stair, at 2700 K.", lines: ["okonkwo-marchetti.com"] },
      },
    ],
    cites: ["concept.primitives.pool", "concept.primitives.interval", "concept.idea"],
  },
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
    fit: "Big Shoulders was drawn from the lettering on Chicago’s street signs, so the display face comes from the same streets the brand is about, and its narrow capitals fit the long double surname on one line. Chivo is a sturdy grotesque with clear figures, for the numbers the studio works in: lux, kelvin and fixture counts.",
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
