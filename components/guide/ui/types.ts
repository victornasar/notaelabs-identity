import type { ActiveBrand } from "@/lib/brand/active";
import type { PageSection } from "@/lib/brand/sections";

export type BrandProps = { active: ActiveBrand };
/** What every numbered section receives. */
export type SectionProps = BrandProps & { section: PageSection };
