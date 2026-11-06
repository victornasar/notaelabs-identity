import { ClosingSection } from "@/components/shell/closing-section";
import { ColorSection } from "@/components/shell/color-section";
import { DeviceSection } from "@/components/shell/device-section";
import { IndexBar, type Section } from "@/components/shell/index-bar";
import { IntroSection } from "@/components/shell/intro-section";
import { LogoMarkSection, WordmarkSection } from "@/components/shell/logo-section";
import { Mark } from "@/components/shell/mark";
import { Reveal } from "@/components/shell/reveal";
import { TypeSection } from "@/components/shell/type-section";
import { getBrand } from "@/lib/brand/active";

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const active = getBrand((await params).brand);
  const { brand, svg } = active;

  // The book's eight sections, in order; the reveal is the intro's cover. A section
  // the brand has nothing for yet is left out.
  const sections: Section[] = [
    { id: "intro", label: "Intro" },
    { id: "wordmark", label: "Wordmark" },
    ...(brand.marks.symbol ? [{ id: "logo-mark", label: "Logo mark" }] : []),
    ...(brand.device ? [{ id: "device", label: "Device" }] : []),
    { id: "color", label: "Colors" },
    { id: "type", label: "Typography" },
    ...(brand.voice ? [{ id: "closing", label: "Closing" }] : []),
  ];
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
        <IntroSection active={active} number={number("intro")} />
        <WordmarkSection active={active} number={number("wordmark")} />
        <LogoMarkSection active={active} number={number("logo-mark")} />
        <DeviceSection active={active} number={number("device")} />
        <ColorSection active={active} number={number("color")} />
        <TypeSection active={active} number={number("type")} />
        <ClosingSection active={active} number={number("closing")} />
      </main>
    </>
  );
}
