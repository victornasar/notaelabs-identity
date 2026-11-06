import localFont from "next/font/local";

// The shell's own voice: index, labels, values. The same for every client.
export const shell = localFont({
  src: "./GeistMono.ttf",
  variable: "--shell",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
