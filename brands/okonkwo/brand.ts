import { defineBrand } from "@/lib/brand/schema";

// A fictional studio. It exists to break every assumption Notae lets the shell
// get away with: a long hyphenated name, no symbol, a loud palette.
export default defineBrand({
  slug: "okonkwo",
  name: "Okonkwo-Marchetti Architectural Lighting Studio",
  edition: "Brand guidelines · Edition 1 · November 2026",
  positioning:
    "We design the light in buildings people remember at night: lobbies, stairwells, bridges, and the long walk home.",
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
    },
    alternates: [
      { file: "stacked.svg", name: "Stacked", use: "Square formats: avatars, signage, cards." },
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
    },
    {
      name: "Basalt",
      role: "ink",
      proportion: 24,
      hex: "#1B1A17",
      cmyk: "60 55 60 85",
      pantone: "Black 7 C",
      use: "Night. Type, and full-bleed evening fields.",
    },
    {
      name: "Sodium",
      role: "accent",
      proportion: 16,
      hex: "#FF5A1F",
      cmyk: "0 75 95 0",
      pantone: "Orange 021 C",
      use: "The streetlight. Openings, covers, and one thing per page.",
    },
    {
      name: "Filament",
      role: "support",
      proportion: 7,
      hex: "#F6C445",
      cmyk: "0 22 80 0",
      pantone: "7406 C",
      use: "Highlights on Basalt. Never text on Limestone.",
    },
    {
      name: "Mercury",
      role: "support",
      proportion: 5,
      hex: "#2E5E58",
      cmyk: "80 35 55 25",
      pantone: "5477 C",
      use: "Cool counterweight. Diagrams and secondary fields.",
    },
  ],
  type: {
    display: {
      family: "Bricolage Grotesque",
      role: "Headlines, set tight and heavy.",
      source: "Google Fonts · OFL",
    },
    text: {
      family: "Instrument Sans",
      role: "Everything people read for longer than a glance.",
      source: "Google Fonts · OFL",
    },
  },
  reveal: { mark: "primary", compactMark: "stacked.svg", ground: "Sodium", ink: "Basalt" },
});
