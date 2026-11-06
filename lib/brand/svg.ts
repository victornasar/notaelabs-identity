/** Reading single-color SVG marks and graphics as strings. */

export type ViewBox = { x: number; y: number; w: number; h: number };

/** An SVG's viewBox. Every mark and graphic has one; a file without one is broken. */
export function viewBox(svg: string): ViewBox {
  const values = svg.match(/viewBox="([^"]+)"/)?.[1]?.trim().split(/[\s,]+/).map(Number);
  if (!values || values.length !== 4 || values.some((v) => !Number.isFinite(v))) {
    throw new Error(`SVG has no usable viewBox: ${svg.slice(0, 80)}`);
  }
  const [x, y, w, h] = values as [number, number, number, number];
  return { x, y, w, h };
}

/**
 * The middle third of a drawing, where a row device's shapes sit, so a band of
 * it stays low. Returns the cropped SVG and its aspect ratio.
 */
export function strip(svg: string) {
  const { x, y, w, h } = viewBox(svg);
  return { svg: svg.replace(/viewBox="[^"]+"/, `viewBox="${x} ${y + h / 3} ${w} ${h / 3}"`), aspect: w / (h / 3) };
}

/** Width over height. */
export const aspect = (svg: string) => {
  const { w, h } = viewBox(svg);
  return w / h;
};
