import localFont from "next/font/local";

// Distinct names: next/font derives the font-family from them, and dev loads every brand.

const okonkwoDisplay = localFont({
  src: "./fonts/BricolageGrotesque.ttf",
  variable: "--brand-display",
  weight: "200 800",
  display: "swap",
});

const okonkwoText = localFont({
  src: "./fonts/InstrumentSans.ttf",
  variable: "--brand-text",
  weight: "400 700",
  display: "swap",
});

export { okonkwoDisplay as display, okonkwoText as text };
