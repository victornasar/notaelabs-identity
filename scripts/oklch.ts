/**
 * Palette scratchpad: give colors in OKLCH, get hex, gamut, and every contrast pair.
 *
 *   pnpm oklch "Paper=96% 0.012 85" "Ink=22% 0.02 60" "Clay=52% 0.13 40"
 */
import { contrast, oklchToHex, wcagLevel } from "../lib/brand/color";

const colors = process.argv.slice(2).map((arg, i) => {
  const [name, value] = arg.includes("=") ? arg.split("=") : [`c${i + 1}`, arg];
  return { name, value, ...oklchToHex(value) };
});
for (const c of colors) console.log(`${c.name.padEnd(12)} oklch(${c.value})  ${c.hex}${c.inGamut ? "" : "  OUT OF sRGB GAMUT: lower the chroma"}`);
for (const [i, a] of colors.entries()) {
  for (const b of colors.slice(i + 1)) {
    const ratio = contrast(a.hex, b.hex);
    console.log(`${`${a.name} / ${b.name}`.padEnd(26)} ${ratio.toFixed(2)}:1  ${wcagLevel(ratio) ?? "fails"}`);
  }
}
