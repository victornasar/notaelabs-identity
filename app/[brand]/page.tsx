import { Nav, type Section } from "@/components/guide/nav";
import { Band, Closing, Colors, Hero, Marks, Type, Voice } from "@/components/guide/sections";
import { Mark } from "@/components/shell/mark";
import { getBrand } from "@/lib/brand/active";

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const active = getBrand((await params).brand);
  const { brand, svg } = active;

  const sections: Section[] = [
    { id: "marks", label: "Marks" },
    { id: "color", label: "Color" },
    { id: "type", label: "Type" },
    ...(brand.voice ? [{ id: "voice", label: "Voice" }] : []),
  ];

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
        <Marks active={active} />
        <Colors active={active} />
        <Type active={active} />
        <Voice active={active} />
      </main>
      <Closing active={active} />
    </>
  );
}
