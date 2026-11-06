import localFont from "next/font/local";

// Distinct names: next/font derives the font-family from them, and dev loads every brand.

const okonkwoDisplay = localFont({
  src: "./fonts/big-shoulders/BigShoulders[opsz,wght].ttf",
  variable: "--brand-display",
  weight: "100 900",
  display: "swap",
});

const okonkwoText = localFont({
  src: "./fonts/chivo/Chivo[wght].ttf",
  variable: "--brand-text",
  weight: "100 900",
  display: "swap",
});

export { okonkwoDisplay as display, okonkwoText as text };
