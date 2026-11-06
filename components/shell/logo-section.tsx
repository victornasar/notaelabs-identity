import type { CSSProperties } from "react";
import type { ActiveBrand } from "@/lib/brand/active";
import { contrast } from "@/lib/brand/color";
import { minimumContrast, type BrandColor, type BrandMark } from "@/lib/brand/schema";
import { Mark } from "./mark";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./logo-section.module.css";

/** The heights the minimum-size row draws the marks at, in px. */
const SIZES = [48, 24, 16];

/** What goes wrong with every mark, drawn on the brand's own primary mark. */
const MISUSES = [
  { id: "stretch", says: "Don’t stretch or squash it." },
  { id: "rotate", says: "Don’t rotate it." },
  { id: "recolor", says: "Don’t recolor it outside the palette." },
  { id: "outline", says: "Don’t outline it." },
  { id: "effects", says: "Don’t add shadows, glows or gradients." },
] as const;

function aspect(svg: string) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)![1].split(/\s+/).map(Number);
  return w / h;
}

/**
 * The grounds a mark may sit on. The brand's own list when it gives one;
 * otherwise every pair of its colors that clears the 3:1 graphic minimum.
 */
function grounds(colors: BrandColor[], listed?: { ground: string; ink: string }[]) {
  const named = (name: string) => colors.find((c) => c.name === name)!;
  const pairs = listed
    ? listed.map(({ ground, ink }) => ({ ground: named(ground), ink: named(ink) }))
    : [...colors]
        .sort((a, b) => b.proportion - a.proportion)
        .flatMap((ground) =>
          colors
            .filter((ink) => ink !== ground && contrast(ground.hex, ink.hex) >= minimumContrast.graphic)
            .map((ink) => ({ ground, ink })),
        );
  return pairs.map((p) => ({ ...p, ratio: contrast(p.ground.hex, p.ink.hex) }));
}

/** The wordmark: what it means, how it was drawn, the room it needs and how not to use it. */
export function WordmarkSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand, svg, byRole } = active;
  const { marks, type } = brand;
  const ground = byRole("ground")!;
  const ink = byRole("ink")!;
  const primary = svg(marks.primary);

  return (
    <section id="wordmark" className={book.section} aria-labelledby="wordmark-title">
      <SectionHeader id="wordmark" number={number} title="Wordmark">
        <p>{marks.primary.meaning ?? marks.primary.use}</p>
      </SectionHeader>

      <div className={`${styles.tile} ${styles.hero}`} data-edge style={{ background: ground.hex, color: ink.hex }}>
        <Mark className={styles.fit} svg={primary} label={brand.name} align="xMidYMid" />
      </div>

      {type.wordmark ? (
        <>
          <Subhead label="Construction" title="How it is drawn">
            {type.wordmark.changes.length
              ? `Set in ${type.wordmark.family} (${type.wordmark.setting}), then changed by hand.`
              : `Set in ${type.wordmark.family} (${type.wordmark.setting}), as it comes.`}
          </Subhead>
          <ol className={book.rows}>
            {type.wordmark.changes.map((change, i) => (
              <li key={change} className={`grid ${book.row}`}>
                <p className={`label ${book.rowLabel}`}>{String(i + 1).padStart(2, "0")}</p>
                <p className={book.rowBody}>{change}</p>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <Subhead label="Clear space" title="Room to breathe">
        Keep {marks.clearSpace.basis} clear on every side ({marks.clearSpace.ratio} × the mark’s
        height). Nothing enters the hatched area.
      </Subhead>
      <div className={styles.clearRow}>
        <figure
          className={styles.clear}
          style={{ "--aspect": aspect(primary), "--ratio": marks.clearSpace.ratio } as CSSProperties}
        >
          <div className={styles.clearMark}>
            <Mark svg={primary} label="" />
          </div>
        </figure>
      </div>

      <Subhead label="Misuse" title="Never">
        The marks are drawn once and used as they are.
      </Subhead>
      <ul className={styles.misuses}>
        {MISUSES.map(({ id, says }) => (
          <li key={id}>
            <div className={styles.tile} data-edge style={{ background: ground.hex, color: ink.hex }}>
              <Mark className={`${styles.fit} ${styles[id]}`} svg={primary} label="" align="xMidYMid" />
            </div>
            <p className={styles.groundName}>{says}</p>
          </li>
        ))}
      </ul>
      {marks.misuse?.length ? (
        <ul className={`${book.rows} ${styles.misuseRules}`}>
          {marks.misuse.map((rule) => (
            <li key={rule} className={`grid ${book.row}`}>
              <p className={`label ${book.rowLabel}`}>Never</p>
              <p className={book.rowBody}>{rule}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** The logo mark: what it represents, its lockups, the grounds it sits on and how small it goes. */
export function LogoMarkSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand, svg, byRole } = active;
  const { marks } = brand;
  if (!marks.symbol) return null;
  const ground = byRole("ground")!;
  const ink = byRole("ink")!;
  const family: BrandMark[] = [marks.symbol, ...(marks.alternates ?? [])];
  const symbol = svg(marks.symbol);

  return (
    <section id="logo-mark" className={book.section} aria-labelledby="logo-mark-title">
      <SectionHeader id="logo-mark" number={number} title="Logo mark">
        <p>{marks.symbol.meaning ?? marks.symbol.use}</p>
      </SectionHeader>

      <ul className={styles.family}>
        {family.map((m, i) => (
          <li key={m.file} className={styles.member} data-lead={i === 0 || undefined}>
            <div className={styles.tile} data-edge style={{ background: ground.hex, color: ink.hex }}>
              <Mark className={styles.fit} svg={svg(m)} label={`${brand.name} ${m.name.toLowerCase()}`} align="xMidYMid" />
            </div>
            <p className={styles.memberName}>{m.name}</p>
            <p className={book.quiet}>{m.use}</p>
          </li>
        ))}
      </ul>

      <Subhead label="Grounds" title="Where it sits">
        Every ground the marks may sit on, with the one ink they take there.
      </Subhead>
      <ul className={styles.grounds}>
        {grounds(brand.colors, marks.on).map(({ ground: g, ink: k, ratio }) => (
          <li key={`${g.name}-${k.name}`}>
            <div className={styles.tile} style={{ background: g.hex, color: k.hex }} data-edge={g === ground || undefined}>
              <Mark className={styles.fit} svg={symbol} label="" align="xMidYMid" />
            </div>
            <p className={styles.groundName}>
              {k.name} on {g.name}
            </p>
            <p className={`label ${book.quiet}`}>{ratio.toFixed(2)}:1</p>
          </li>
        ))}
      </ul>

      <Subhead label="Minimum size" title="How small it goes">
        On screen: {marks.minimumSize.screen}.
        {marks.minimumSize.print ? ` In print: ${marks.minimumSize.print}.` : ""}
      </Subhead>
      <ul className={book.rows}>
        {SIZES.map((size) => (
          <li key={size} className={`grid ${book.row} ${styles.sizeRow}`}>
            <p className={`label ${book.rowLabel}`}>{size} px</p>
            <div className={styles.sizes} style={{ "--h": `${size}px` } as CSSProperties}>
              {[marks.symbol!, marks.primary].map((m) => (
                <Mark key={m.file} className={styles.sized} svg={svg(m)} label="" />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
