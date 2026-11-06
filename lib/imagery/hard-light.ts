/**
 * Hard light: lamps, beams and pools with sharp edges and no blur, in two flat
 * colors. For brands whose strategy rules out glow and gradients. The seed picks
 * the composition and places it; the same seed always draws the same image.
 */
import { random } from "./random";

export type HardLightInput = {
  width: number;
  height: number;
  seed: number;
  ground: string;
  ink: string;
  /** How far a beam widens for each unit it falls, each side. */
  spread?: number;
  /** A pool's width over its height. */
  poolRatio?: number;
};

const compositions = ["street", "single", "path"] as const;

export function hardLight({ width: W, height: H, seed, ground, ink, spread = 7 / 15, poolRatio = 3 }: HardLightInput) {
  const rand = random(seed);
  const shapes: string[] = [];
  const n = (v: number) => Math.round(v * 10) / 10;
  const pool = (cx: number, cy: number, w: number, flatten = 1) =>
    shapes.push(`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(w / 2)}" ry="${n(w / poolRatio / 2 / flatten)}"/>`);
  // A beam leaves its cut-off at `top`, falls `drop`, and stops `gap` above its pool,
  // so beam and pool never merge into one shape.
  const lamp = (cx: number, top: number, drop: number, mouth: number, gap: number, flatten = 1) => {
    const foot = mouth + 2 * spread * drop;
    shapes.push(
      `<path d="M${n(cx - mouth / 2)} ${n(top)}H${n(cx + mouth / 2)}L${n(cx + foot / 2)} ${n(top + drop)}H${n(cx - foot / 2)}Z"/>`,
    );
    const w = foot * 1.2;
    pool(cx, top + drop + gap + w / poolRatio / 2 / flatten, w, flatten);
  };

  const composition = compositions[Math.floor(rand() * compositions.length)];
  const side = rand() < 0.5 ? 1 : -1;
  const mirror = (x: number) => (side > 0 ? x : W - x);
  const unit = Math.min(W, H);

  if (composition === "single") {
    // One lamp, large and off-centre, its beam hanging from the top edge.
    const cx = mirror(W * (0.3 + rand() * 0.15));
    const drop = H * (0.5 + rand() * 0.12);
    lamp(cx, 0, drop, unit * 0.06, unit * 0.035);
  } else {
    // Lamps receding to a vanishing point, smaller and closer together with depth.
    const horizon = H * (0.38 + rand() * 0.1);
    const vx = mirror(W * (0.62 + rand() * 0.2));
    const nearX = mirror(W * (0.12 + rand() * 0.1));
    const count = 7;
    const depth = 0.55 + rand() * 0.25;
    for (let k = count - 1; k >= 0; k--) {
      const s = 1 / (1 + k * depth);
      const gx = vx + (nearX - vx) * s;
      const gy = horizon + (H * 1.02 - horizon) * s;
      const w = unit * 0.5 * s;
      if (composition === "street") {
        const drop = unit * 0.42 * s;
        const head = gy - drop - unit * 0.12 * s;
        lamp(gx, head, drop, unit * 0.04 * s, unit * 0.02 * s, 1.6);
      } else {
        pool(gx, gy, w, 2.2);
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${ground}"/><g fill="${ink}">${shapes.join("")}</g></svg>`
  );
}
