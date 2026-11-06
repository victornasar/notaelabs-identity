import { Closing } from "@/components/guide/closing";
import { Colors } from "@/components/guide/colors";
import { Band, Hero } from "@/components/guide/hero";
import { Imagery } from "@/components/guide/imagery";
import { Marks } from "@/components/guide/marks";
import { Nav } from "@/components/guide/nav";
import { Type } from "@/components/guide/type";
import type { SectionProps } from "@/components/guide/ui/types";
import { Voice } from "@/components/guide/voice";
import { Mark } from "@/components/shell/mark";
import { getBrand } from "@/lib/brand/active";
import { pageSections, type NavSectionId } from "@/lib/brand/sections";

type Body = (props: SectionProps) => React.ReactNode;

// Each nav section's component. The cover and closing frame every page.
const bodies: Record<NavSectionId, Body> = {
  marks: Marks,
  color: Colors,
  type: Type,
  imagery: Imagery,
  voice: Voice,
};

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const active = getBrand((await params).brand);
  const { brand, svg } = active;
  const sections = pageSections(brand);

  return (
    <>
      <Nav
        name={brand.name}
        symbol={<Mark svg={svg(brand.marks.symbol ?? brand.marks.primary)} label="" align="xMidYMid" />}
        sections={sections}
      />
      <main>
        <Hero active={active} />
        <Band active={active} />
        {sections.map((section) => {
          const Body = bodies[section.id];
          return <Body key={section.id} active={active} section={section} />;
        })}
      </main>
      <Closing active={active} />
    </>
  );
}
