import { ColorSection } from "@/components/shell/color-section";
import { IndexBar, type Section } from "@/components/shell/index-bar";
import { Mark } from "@/components/shell/mark";
import { Reveal } from "@/components/shell/reveal";
import { getBrand } from "@/lib/brand/active";

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const active = getBrand((await params).brand);
  const { brand, svg } = active;

  const sections: Section[] = [{ id: "color", label: "Color" }];
  const number = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  return (
    <>
      <Reveal active={active} />
      <IndexBar
        name={brand.name}
        symbol={
          brand.marks.symbol ? (
            <Mark svg={svg(brand.marks.symbol)} label="" align="xMidYMid" />
          ) : undefined
        }
        sections={sections}
      />
      <main>
        <ColorSection active={active} number={number("color")} />
      </main>
    </>
  );
}
