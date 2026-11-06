import { ColorSection } from "@/components/shell/color-section";
import { IndexBar, type Section } from "@/components/shell/index-bar";
import { LogoSection } from "@/components/shell/logo-section";
import { Mark } from "@/components/shell/mark";
import { Reveal } from "@/components/shell/reveal";
import { StorySection } from "@/components/shell/story-section";
import { TypeSection } from "@/components/shell/type-section";
import { VoiceSection } from "@/components/shell/voice-section";
import { getBrand } from "@/lib/brand/active";

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const active = getBrand((await params).brand);
  const { brand, svg } = active;

  // Presentation order: why, then the identity, then how to write it.
  const sections: Section[] = [
    { id: "story", label: "Story" },
    { id: "logo", label: "Logo" },
    { id: "type", label: "Type" },
    { id: "color", label: "Color" },
    ...(brand.voice ? [{ id: "voice", label: "Voice" }] : []),
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
        <StorySection active={active} number={number("story")} />
        <LogoSection active={active} number={number("logo")} />
        <TypeSection active={active} number={number("type")} />
        <ColorSection active={active} number={number("color")} />
        <VoiceSection active={active} number={number("voice")} />
      </main>
    </>
  );
}
