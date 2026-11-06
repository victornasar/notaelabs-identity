import localFont from "next/font/local";

// Distinct names: next/font derives the font-family from them, and dev loads every brand.

const fixtureSparseDisplay = localFont({
  src: "./fonts/familjen-grotesk/FamiljenGrotesk[wght].ttf",
  variable: "--brand-display",
  weight: "400 700",
  display: "swap",
});

const fixtureSparseText = localFont({
  src: "./fonts/libre-franklin/LibreFranklin[wght].ttf",
  variable: "--brand-text",
  weight: "100 900",
  display: "swap",
});

export { fixtureSparseDisplay as display, fixtureSparseText as text };
