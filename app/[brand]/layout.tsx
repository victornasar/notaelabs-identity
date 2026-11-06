import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { DevSwitcher } from "@/components/shell/dev-switcher";
import { getBrand, slugs } from "@/lib/brand/active";
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
  const { brand, fonts, byRole } = getBrand((await params).brand);
  const ink = byRole("ink")!;

  const vars = {
    "--ground": byRole("ground")!.hex,
    "--ink": ink.hex,
    "--accent": (byRole("accent") ?? ink).hex,
    "--support": (byRole("support") ?? ink).hex,
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
