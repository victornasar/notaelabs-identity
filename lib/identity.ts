export const routes = [
  { href: "/", label: "Story" },
  { href: "/voice", label: "Voice" },
  { href: "/marks", label: "Marks" },
  { href: "/color-and-type", label: "Color and type" },
  { href: "/applications", label: "Applications" },
  { href: "/rules-and-files", label: "Rules and files" },
] as const;

export const positioning =
  "Notae Labs turns a founder’s brief into a living brand site the team can use without us in the room.";

export const colors = [
  {
    name: "Paper",
    oklch: "oklch(96.73% 0.007 88.64)",
    hex: "#F6F4EF",
    print: "The paper stock. Warm uncoated white. No tint.",
    swatch: "var(--paper)",
    on: "var(--ink)",
  },
  {
    name: "Ink",
    oklch: "oklch(20.05% 0.004 84.59)",
    hex: "#171614",
    print: "Text and rules: 0 0 0 100. Large fields: 30 20 20 100.",
    swatch: "var(--ink)",
    on: "var(--paper)",
  },
  {
    name: "Secondary",
    oklch: "oklch(35.75% 0.009 80.68)",
    hex: "#3F3C37",
    print: "0 0 0 70, and only on paper.",
    swatch: "var(--secondary)",
    on: "var(--paper)",
  },
  {
    name: "Signal",
    oklch: "oklch(47.31% 0.223 265.82)",
    hex: "#2046D6",
    print: "90 65 0 0.",
    swatch: "var(--signal)",
    on: "var(--paper)",
  },
  {
    name: "Dark signal",
    oklch: "oklch(87.56% 0.061 273.83)",
    hex: "#C9D4FF",
    print: "Screen only, on ink.",
    swatch: "var(--dark-signal)",
    on: "var(--ink)",
    ground: "var(--ink)",
  },
] as const;

export const contrast = [
  ["Ink on paper", "16.45"],
  ["Secondary on paper", "9.99"],
  ["Signal on paper", "6.57"],
  ["Dark signal on ink", "12.35"],
] as const;

export const downloads = [
  {
    group: "Wordmark",
    files: [
      ["SVG", "/marks/notae-wordmark.svg"],
      ["SVG on ink", "/marks/notae-wordmark-on-ink.svg"],
      ["PDF", "/marks/notae-wordmark.pdf"],
      ["PNG 16", "/marks/notae-wordmark-16.png"],
      ["PNG 32", "/marks/notae-wordmark-32.png"],
      ["PNG 180", "/marks/notae-wordmark-180.png"],
      ["PNG 512", "/marks/notae-wordmark-512.png"],
    ],
  },
  {
    group: "Short wordmark",
    files: [
      ["SVG", "/marks/notae-wordmark-short.svg"],
      ["SVG on ink", "/marks/notae-wordmark-short-on-ink.svg"],
      ["PDF", "/marks/notae-wordmark-short.pdf"],
      ["PNG 16", "/marks/notae-wordmark-short-16.png"],
      ["PNG 32", "/marks/notae-wordmark-short-32.png"],
      ["PNG 180", "/marks/notae-wordmark-short-180.png"],
      ["PNG 512", "/marks/notae-wordmark-short-512.png"],
    ],
  },
  {
    group: "Logomark",
    files: [
      ["SVG", "/marks/notae-logomark.svg"],
      ["SVG on ink", "/marks/notae-logomark-on-ink.svg"],
      ["PDF", "/marks/notae-logomark.pdf"],
      ["PNG 16", "/marks/notae-logomark-16.png"],
      ["PNG 32", "/marks/notae-logomark-32.png"],
      ["PNG 180", "/marks/notae-logomark-180.png"],
      ["PNG 512", "/marks/notae-logomark-512.png"],
    ],
  },
  {
    group: "Lockup",
    files: [
      ["SVG", "/marks/notae-lockup.svg"],
      ["SVG on ink", "/marks/notae-lockup-on-ink.svg"],
      ["PDF", "/marks/notae-lockup.pdf"],
      ["PNG 16", "/marks/notae-lockup-16.png"],
      ["PNG 32", "/marks/notae-lockup-32.png"],
      ["PNG 180", "/marks/notae-lockup-180.png"],
      ["PNG 512", "/marks/notae-lockup-512.png"],
    ],
  },
  {
    group: "Color",
    files: [["Text", "/notae-colors.txt"]],
  },
] as const;
