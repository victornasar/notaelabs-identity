/** The words the page uses for the schema's names. */
import type { ApplicationKind, ColorRole, TypeStyle } from "./schema";

export const roleNames: Record<ColorRole, string> = {
  ground: "Ground",
  ink: "Ink",
  accent: "Accent",
  support: "Support",
};

export const faceNames: Record<TypeStyle["face"], string> = {
  display: "Display",
  text: "Text",
  mono: "Mono",
};

export const kindNames: Record<ApplicationKind, string> = {
  website: "Website",
  "business-card": "Business card",
  letterhead: "Letterhead",
  "email-signature": "Email signature",
  "social-post": "Social post",
  deck: "Deck",
  signage: "Signage",
  poster: "Poster",
  "app-icon": "App icon",
  dashboard: "Dashboard",
};
