import type { CSSProperties } from "react";
import type { ActiveBrand } from "@/lib/brand/active";
import { bestOn, contrast, toOklch, toRgbString, wcagLevel } from "@/lib/brand/color";
import type { BrandColor } from "@/lib/brand/schema";
import { CopyValue } from "./copy-value";
import { SectionHeader } from "./section-header";
import styles from "./color-section.module.css";

const ROLE_NAMES: Record<BrandColor["role"], string> = {
  ground: "Ground",
  ink: "Ink",
  accent: "Accent",
  support: "Support",
};

// Labels inside the proportion bar only where the band is wide enough to hold them.
const LABEL_MIN_SHARE = 10;

export function ColorSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { colors } = active.brand;
  const hexes = colors.map((c) => c.hex);
  const on = (c: BrandColor) => bestOn(c.hex, hexes);
  const ground = colors.find((c) => c.role === "ground")!;

  // Every unordered pair once, set on whichever color covers more of a page.
  const pairs = colors
    .flatMap((a, i) => colors.slice(i + 1).map((b) => (a.proportion >= b.proportion ? [a, b] : [b, a])))
    .map(([back, fore]) => ({ back, fore, ratio: contrast(back.hex, fore.hex) }))
    .sort((x, y) => y.ratio - x.ratio);
  const passing = pairs.filter((p) => wcagLevel(p.ratio));
  const failing = pairs.filter((p) => !wcagLevel(p.ratio));

  return (
    <section id="color" className={styles.section} aria-labelledby="color-title">
      <SectionHeader id="color" number={number} title="Color">
        <p>
          {colors.length} colors. The bar below is a typical page: {ground.name} carries it, and
          everything else earns its share.
        </p>
      </SectionHeader>

      <figure className={styles.proportion}>
        <div className={styles.bar}>
          {colors.map((c) => (
            <div
              key={c.name}
              className={styles.band}
              style={{ flexGrow: c.proportion, background: c.hex, color: on(c) } as CSSProperties}
              title={`${c.name}, ${c.proportion}%`}
            >
              {c.proportion >= LABEL_MIN_SHARE ? (
                <>
                  <span className={styles.bandName}>{c.name}</span>
                  <span className={`label ${styles.bandShare}`}>{c.proportion}%</span>
                </>
              ) : null}
            </div>
          ))}
        </div>
        <figcaption className={`grid ${styles.caption}`}>
          <span className="label">A typical page, by area</span>
          <span className={`label ${styles.captionList}`}>
            {colors.map((c) => `${c.name} ${c.proportion}`).join(" · ")}
          </span>
        </figcaption>
      </figure>

      <ul className={styles.cards}>
        {colors.map((c) => (
          <li
            key={c.name}
            className={`grid ${styles.card}`}
            data-ground={c === ground || undefined}
            style={{ background: c.hex, color: on(c) }}
          >
            <div className={styles.cardHead}>
              <p className={`label ${styles.role}`}>
                {ROLE_NAMES[c.role]} · {c.proportion}%
              </p>
              <h3 className={styles.cardName}>{c.name}</h3>
              <p className={styles.use}>{c.use}</p>
            </div>
            <div className={styles.values}>
              <CopyValue label="Hex" value={c.hex.toUpperCase()} />
              <CopyValue label="OKLCH" value={toOklch(c.hex)} />
              <CopyValue label="RGB" value={toRgbString(c.hex)} />
              {c.cmyk ? <CopyValue label="CMYK" value={c.cmyk} /> : null}
              {c.pantone ? <CopyValue label="Pantone" value={c.pantone} /> : null}
            </div>
          </li>
        ))}
      </ul>

      <div className={`grid ${styles.contrastHead}`}>
        <p className={`label ${styles.contrastLabel}`}>Contrast</p>
        <h3 className={styles.contrastTitle}>Pairs that read</h3>
        <p className={styles.contrastIntro}>
          Every combination that clears WCAG, strongest first. Body text needs AA; AA Large is
          for display sizes only.
        </p>
      </div>

      <ul className={styles.pairs}>
        {passing.map(({ back, fore, ratio }) => (
          <li key={`${back.name}-${fore.name}`} className={styles.pair}>
            <div
              className={styles.sample}
              data-ground={back === ground || undefined}
              style={{ background: back.hex, color: fore.hex }}
            >
              <span className={styles.sampleGlyphs} aria-hidden="true">
                Aa
              </span>
            </div>
            <p className={styles.pairName}>
              {fore.name} on {back.name}
            </p>
            <p className={`label ${styles.pairRatio}`}>
              {ratio.toFixed(2)}:1 · {wcagLevel(ratio)}
            </p>
          </li>
        ))}
      </ul>

      {failing.length ? (
        <p className={`grid ${styles.never}`}>
          <span className={`label ${styles.neverLabel}`}>Never for text</span>
          <span className={styles.neverList}>
            {failing.map(({ back, fore, ratio }, i) => (
              <span key={`${back.name}-${fore.name}`}>
                {fore.name} on {back.name}{" "}
                <span className={`label ${styles.neverRatio}`}>{ratio.toFixed(2)}:1</span>
                {i < failing.length - 1 ? ", " : "."}
              </span>
            ))}
          </span>
        </p>
      ) : null}
    </section>
  );
}
