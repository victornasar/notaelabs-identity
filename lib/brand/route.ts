/**
 * A route is one of the three directions shown to the client after the
 * strategy is approved. It lives in `brands/<slug>/work/routes/<a|b|c>/route.ts`
 * and makes the same visual choices a brand does, citing the same strategy,
 * plus the sample applications the /routes page draws.
 */

import type { BrandColor, Marks, TypeSystem } from "./schema";

/** Text and colors for one sample application. Colors are names from the route's palette. */
type Surface = { ground: string; ink: string };

export type Route = {
  letter: "a" | "b" | "c";
  /** Two or three words. */
  name: string;
  /** How this route reads the concept, in one or two sentences. */
  idea: string;
  marks: Marks;
  colors: BrandColor[];
  type: TypeSystem;
  applications: {
    /** The mark on an app icon. A mark file from `marks/`. */
    tile: Surface & { mark: string };
    hero: Surface & { headline: string; sub: string; action: string };
    card: Surface & { name: string; title: string; lines: string[] };
  };
  /**
   * Written after looking at the PNGs in `renders/`: whether every mark reads,
   * and what was seen. A route with an unreadable mark is not shown.
   */
  review: Record<"at16" | "at64" | "lockup", { readable: boolean; saw: string }>;
};

export function defineRoute<const R extends Route>(route: R): R {
  return route;
}
