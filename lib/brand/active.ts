import { notFound } from "next/navigation";
import { brands, defaultSlug } from "@/brands/registry.generated";
import type { Brand, BrandColor, BrandMark } from "./schema";

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

  const mark = (key: string): BrandMark => {
    if (key === "primary") return brand.marks.primary;
    if (key === "symbol" && brand.marks.symbol) return brand.marks.symbol;
    const alternate = brand.marks.alternates?.find((m) => m.file === key || m.name === key);
    return alternate ?? brand.marks.primary;
  };
  const svg = (m: BrandMark) => {
    const source = entry.marks[m.file];
    if (!source) throw new Error(`${slug}: marks/${m.file} is missing.`);
    return source;
  };

  return { slug, brand, fonts: entry.fonts, color, byRole, mark, svg };
}
