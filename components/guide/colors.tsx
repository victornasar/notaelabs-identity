import type { CSSProperties } from "react";
import { bestOn, contrast, toOklch, toRgbString, wcagLevel } from "@/lib/brand/color";
import { printNote, roleNames } from "@/lib/brand/labels";
import { minimumContrast } from "@/lib/brand/schema";
import { sectionTitle } from "@/lib/brand/sections";
import styles from "./colors.module.css";
import { CopyChip } from "./ui/copy-chip";
import { Heading } from "./ui/heading";
import type { SectionProps } from "./ui/types";
import ui from "./ui/ui.module.css";

/** The palette as cards as wide as their share of a page, every value one click from the clipboard. */
export function Colors({ active, section }: SectionProps) {
  const { colors } = active.brand;
  const hexes = colors.map((c) => c.hex);
  const { ground } = active.roles;
  const ordered = [...colors].sort((a, b) => b.proportion - a.proportion);

  const pairs = colors
    .flatMap((a, i) => colors.slice(i + 1).map((b) => (a.proportion >= b.proportion ? ([a, b] as const) : ([b, a] as const))))
    .map(([back, fore]) => ({ back, fore, ratio: contrast(back.hex, fore.hex) }))
    .sort((x, y) => y.ratio - x.ratio);

  return (
    <section id="color" className={`${ui.container} ${ui.section}`} aria-labelledby="color-title">
      <Heading section={section} title={sectionTitle(active.brand, "color")}>
        Each card is as wide as the color’s share of a typical page.
      </Heading>

      <ul className={styles.swatches}>
        {ordered.map((c) => (
          <li
            key={c.name}
            className={styles.swatch}
            data-edge={c === ground || undefined}
            style={{ "--share": c.proportion, background: c.hex, color: bestOn(c.hex, hexes) } as CSSProperties}
          >
            <div>
              <p className={styles.swatchRole}>
                {roleNames[c.role]} · {c.proportion}%
              </p>
              <h3 className={styles.swatchName}>{c.name}</h3>
              <p className={styles.swatchUse}>{c.use}</p>
            </div>
            <div className={styles.chips}>
              <CopyChip label="Hex" value={c.hex.toUpperCase()} />
              <CopyChip label="RGB" value={toRgbString(c.hex)} />
              <CopyChip label="OKLCH" value={toOklch(c.hex)} />
              {c.cmyk ? <CopyChip label="CMYK" value={c.cmyk} /> : null}
              {c.pantone ? <CopyChip label="Pantone" value={c.pantone} /> : null}
            </div>
          </li>
        ))}
      </ul>

      <h3 className={ui.subtitle}>Pairs that read</h3>
      <ul className={styles.contrasts}>
        {pairs.map(({ back, fore, ratio }) => {
          const level = wcagLevel(ratio);
          const graphicOnly = !level && ratio >= minimumContrast.graphic;
          return (
            <li key={`${back.name}-${fore.name}`} className={styles.contrast} data-fails={!level || undefined}>
              <span
                className={styles.contrastSample}
                data-edge={back === ground || undefined}
                style={{ background: back.hex, color: fore.hex }}
                aria-hidden="true"
              >
                Aa
              </span>
              <span>
                {fore.name} on {back.name}
                <span className={ui.quiet}>
                  {" "}
                  {ratio.toFixed(2)}:1 · {level ?? (graphicOnly ? "Graphics only" : "Never for text")}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {active.brand.printProfile && colors.some((c) => c.cmyk) ? (
        <p className={ui.footnote}>
          {printNote(active.brand.printProfile)}
        </p>
      ) : null}
    </section>
  );
}
