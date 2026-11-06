import { notFound } from "next/navigation";
import { brands, defaultSlug } from "@/brands/registry.generated";
import type { Brand, BrandColor, BrandMark } from "./schema";
import { strip } from "./svg";

export { defaultSlug };
export const slugs = Object.keys(brands);

export type ActiveBrand = ReturnType<typeof getBrand>;

export function getBrand(slug: string) {
  if (!(slug in brands)) notFound();
  const entry = brands[slug as keyof typeof brands];
  const brand: Brand = entry.brand;

  const color = (name: string): BrandColor => {
    const found = brand.colors.find((c) => c.name === name);
    if (!found) throw new Error(`${slug}: no color named "${name}".`);
    return found;
  };
  const byRole = (role: BrandColor["role"]) => brand.colors.find((c) => c.role === role);
  const required = (role: BrandColor["role"]) => {
    const found = byRole(role);
    if (!found) throw new Error(`${slug}: needs a "${role}" color.`);
    return found;
  };
  // Every page needs a ground and an ink; accent and support fall back to the ink.
  const ink = required("ink");
  const roles = { ground: required("ground"), ink, accent: byRole("accent") ?? ink, support: byRole("support") ?? ink };

  const { primary, symbol, alternates = [] } = brand.marks;
  const mark = (key: string): BrandMark => {
    if (key === "primary") return primary;
    if (key === "symbol" && symbol) return symbol;
    const found = [primary, ...(symbol ? [symbol] : []), ...alternates].find((m) => m.file === key || m.name === key);
    if (!found) throw new Error(`${slug}: no mark "${key}".`);
    return found;
  };
  const svg = (m: BrandMark) => {
    const source = entry.marks[m.file];
    if (!source) throw new Error(`${slug}: marks/${m.file} is missing.`);
    return source;
  };

  const graphic = (file: string) => {
    const source = (entry.graphics as Record<string, string>)[file];
    if (!source) throw new Error(`${slug}: graphics/${file} is missing.`);
    return source;
  };

  // The device's drawing cut to the strip its shapes sit on, for rows and bands.
  const deviceStrip = brand.device ? strip(graphic(brand.device.file)) : null;

  return { slug, brand, fonts: entry.fonts, color, byRole, roles, mark, svg, graphic, deviceStrip };
}
