/** Color math: hex in, every other notation and WCAG contrast out. */

export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toLinear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function wcagLevel(ratio: number) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return null;
}

export function toOklch(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = C < 0.0001 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return `oklch(${(L * 100).toFixed(2)}% ${C.toFixed(3)} ${H.toFixed(2)})`;
}

export function toRgbString(hex: string) {
  return `rgb(${hexToRgb(hex).join(" ")})`;
}

/** The brand color with the most contrast against `hex`, for labels set on it. */
export function bestOn(hex: string, candidates: string[]) {
  return candidates.reduce((best, c) => (contrast(hex, c) > contrast(hex, best) ? c : best));
}

/**
 * `oklch(L% C H)` (or "L% C H", or L as 0–1) to hex. Returns `inGamut: false`
 * when sRGB can't show it, after clipping; pick a lower chroma instead.
 */
export function oklchToHex(value: string) {
  const [rawL, C, H] = value.replace(/oklch\(|\)|%/g, "").trim().split(/[\s,]+/).map(Number);
  const L = rawL > 1 ? rawL / 100 : rawL;
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const inGamut = linear.every((c) => c >= -0.0001 && c <= 1.0001);
  const hex = linear
    .map((c) => {
      const v = Math.min(1, Math.max(0, c));
      const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
      return Math.round(srgb * 255).toString(16).padStart(2, "0");
    })
    .join("");
  return { hex: `#${hex.toUpperCase()}`, inGamut };
}
