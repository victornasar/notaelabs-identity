import localFont from "next/font/local";

// Distinct names: next/font derives the font-family from them, and dev loads every brand.

const notaeDisplay = localFont({
  src: "./fonts/SourceSerif4.ttf",
  variable: "--brand-display",
  weight: "200 900",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const notaeText = localFont({
  src: "./fonts/IBMPlexSans.ttf",
  variable: "--brand-text",
  weight: "100 700",
  display: "swap",
});

export { notaeDisplay as display, notaeText as text };
