import type { Metadata } from "next";
import { shell } from "@/lib/fonts/shell";
import "./routes.css";

// Local only: this file exists in `next dev` and nowhere else (see next.config.ts).
export const metadata: Metadata = { title: "Routes", robots: { index: false } };

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={shell.variable}>
      <body>{children}</body>
    </html>
  );
}
