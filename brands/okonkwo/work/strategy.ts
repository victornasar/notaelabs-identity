import { defineStrategy } from "@/lib/brand/schema";

// The decisions in strategy.md, for routes and brand.ts to cite.
export default defineStrategy({
  concept: {
    idea: "Good night light comes in measured pools with honest darkness between them, and that rhythm is the walk home.",
    source: "A lit street seen from above at night: lamp, a pool of light on the pavement, a dark interval, the next lamp. Sodium orange is its most familiar color.",
    primitives: [
      { id: "pool", shape: "A flat ellipse, about 3:1, or the half of it above its long axis", from: "The light a lamp lays on the ground" },
      { id: "cone", shape: "A trapezoid, narrow at the top and widening downward at a fixed angle", from: "A beam leaving a fitting" },
      { id: "interval", shape: "An even, measured gap between repeated pools, equal to one pool's width", from: "The dark between lamps; the rhythm of the walk" },
      { id: "cut-off", shape: "One hard horizontal edge where light stops", from: "A glare-free fitting's cut-off line" },
      { id: "kelvin-steps", shape: "Bands of color stepping from sodium orange (about 1800 K) to warm white (about 3000 K)", from: "Color temperature, the one number every lighting decision names" },
      { id: "dusk-pair", shape: "Two grounds, pale stone by day and basalt by night; the same layout flips at sunset", from: "The same building before and after sunset" },
    ],
  },
  category: {
    name: "Architectural lighting design",
    competitors: ["Speirs Major", "Arup Lighting", "L’Observatoire International"],
    // From the brief's round 2, read from each site's text; not seen.
    identities: [
      { name: "Speirs Major", identity: "The name as plain capitals, “light architecture” as a lowercase descriptor; a sparse, project-led site." },
      { name: "Arup Lighting", identity: "A service line inside Arup’s corporate brand and red logo; full-width project photography, night scenes included." },
      { name: "L’Observatoire International", identity: "A wordmark with a symbol and the line “Lighting the World”; offices listed by city." },
    ],
    conventions: [
      { id: "color-change", convention: "Facades that cycle through colors, with dynamic RGB light as the selling point", seenIn: [], verdict: "reject", why: "“Spectacular” is a never; the studio’s light stays put and stays warm." },
      { id: "dark-and-glow", convention: "Black websites and portfolios with glowing night photographs of lit buildings", seenIn: [], verdict: "reject", why: "“Gloomy” is a never; it treats darkness as a backdrop, not as designed." },
      { id: "spec-sheet", convention: "Technical identities: engineering sans, cool greys, product-catalog grids", seenIn: [], verdict: "reject", why: "“Technical” is a never; the audience buys judgment, not fittings." },
      { id: "night-photography", convention: "Leading with photographs of finished projects at night", seenIn: [], verdict: "keep", why: "The work is seen at night and in photographs; the identity frames them." },
    ],
  },
  equity: {
    status: "refresh",
    assets: [
      { id: "names", asset: "Okonkwo-Marchetti on one line, joined by the hyphen", verdict: "keep", why: "The partnership is the studio." },
      { id: "descriptor", asset: "“Architectural Lighting Studio” as part of the name", verdict: "evolve", why: "Becomes a separate descriptor so the mark holds at small sizes." },
      { id: "sodium", asset: "Sodium, the streetlight orange", verdict: "keep", why: "Edition 1’s strongest asset and the source of the idea." },
      { id: "dusk-pair", asset: "Limestone and Basalt, the day and night pair", verdict: "evolve", why: "Becomes the dusk-pair primitive." },
      { id: "filament-mercury", asset: "Filament yellow and Mercury teal", verdict: "drop", why: "Unless a route earns them as a kelvin-steps band." },
      { id: "voice", asset: "The voice traits Warm and Exacting", verdict: "keep", why: "They describe the studio." },
      { id: "wordmark-e1", asset: "Edition 1’s wordmark, Bricolage Grotesque set as it comes", verdict: "drop", why: "A rejected font, typed out." },
    ],
  },
});
