import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { DevSwitcher } from "@/components/shell/dev-switcher";
import { getBrand, slugs } from "@/lib/brand/active";
import { textTransform } from "@/lib/brand/type";
import { shell } from "@/lib/fonts/shell";
import "../shell.css";

export function generateStaticParams() {
  return slugs.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: LayoutProps<"/[brand]">): Promise<Metadata> {
  const { brand } = getBrand((await params).brand);
  return { title: `${brand.name} · Brand guidelines`, description: brand.positioning };
}

export default async function BrandLayout({ children, params }: LayoutProps<"/[brand]">) {
  const { brand, fonts, roles } = getBrand((await params).brand);
  // The shell's headings follow the brand's largest display step: its weight, case and tracking.
  const display = brand.type.scale.steps.find((s) => s.face === "display");

  const vars = {
    "--ground": roles.ground.hex,
    "--ink": roles.ink.hex,
    "--accent": roles.accent.hex,
    "--support": roles.support.hex,
    "--display-weight": display?.weight ?? brand.type.display.weights[0],
    "--display-case": textTransform(display?.case ?? "as-written"),
    "--display-tracking": `${display?.tracking ?? 0}em`,
  } as CSSProperties;

  return (
    <html
      lang="en"
      className={`${fonts.display.variable} ${fonts.text.variable} ${shell.variable}`}
      style={vars}
    >
      <body>
        {children}
        {process.env.NODE_ENV === "development" ? (
          <DevSwitcher current={brand.slug} slugs={slugs} />
        ) : null}
      </body>
    </html>
  );
}
