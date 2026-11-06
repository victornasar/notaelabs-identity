import type { CSSProperties } from "react";
import { Mark } from "@/components/shell/mark";
import type { ActiveBrand } from "@/lib/brand/active";
import { bestOn, contrast, toOklch, toRgbString, wcagLevel } from "@/lib/brand/color";
import { minimumContrast, type BrandColor, type Face, type TypeStyle } from "@/lib/brand/schema";
import { aspect } from "@/lib/brand/svg";
import { describeStep, textTransform } from "@/lib/brand/type";
import { CopyChip } from "./copy-chip";
import { stripOf } from "./imagery";
import styles from "./guide.module.css";

type Props = { active: ActiveBrand };

const ROLE_NAMES: Record<BrandColor["role"], string> = {
  ground: "Ground",
  ink: "Ink",
  accent: "Accent",
  support: "Support",
};

const FACE_FAMILY: Record<TypeStyle["face"], string> = {
  display: "var(--display)",
  text: "var(--text)",
  mono: "var(--brand-mono, var(--mono))",
};

function Heading({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={`${id}-title`} className={styles.title}>
        {title}
      </h2>
      {children ? <p className={styles.lede}>{children}</p> : null}
    </header>
  );
}

/** The cover: the lamp and the wordmark together, as large as the screen allows. */
export function Hero({ active }: Props) {
  const { brand, svg } = active;
  const lockup = brand.marks.alternates?.[0] ?? brand.marks.primary;

  return (
    <section id="top" className={styles.hero} aria-label={`${brand.name}, brand guidelines`}>
      <div className={styles.heroMeta}>
        <p className={styles.pill}>
          <span className={styles.dot} aria-hidden="true" />
          {brand.edition}
        </p>
      </div>
      <h1 className={styles.heroLockup}>
        <Mark svg={svg(lockup)} label={brand.name} align="xMidYMid" />
      </h1>
      <div className={styles.heroFoot}>
        <p className={styles.heroLede}>{brand.positioning}</p>
        <div className={styles.actions}>
          <a href="#marks" className={styles.button}>
            See the marks
          </a>
          <a href="#imagery" className={`${styles.button} ${styles.ghost}`}>
            See it at work
          </a>
        </div>
      </div>
    </section>
  );
}

/** The graphic device as a band that keeps moving, the street that continues. */
export function Band({ active }: Props) {
  const { brand, color, graphic } = active;
  const { device } = brand;
  if (!device) return null;
  const { svg: drawing, aspect } = stripOf(graphic(device.file));

  return (
    <div
      className={styles.band}
      style={{ background: color(device.ground).hex, color: color(device.ink).hex }}
      aria-hidden="true"
    >
      <div className={styles.bandTrack}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Mark
            key={i}
            className={styles.bandTile}
            style={{ aspectRatio: aspect }}
            svg={drawing}
            label=""
            align="xMinYMid"
          />
        ))}
      </div>
    </div>
  );
}

/** Every mark as a card, the grounds they sit on, and how the wordmark was drawn. */
export function Marks({ active }: Props) {
  const { brand, svg, byRole, color } = active;
  const { marks, type } = brand;
  const ground = byRole("ground")!;
  const ink = byRole("ink")!;
  const accent = byRole("accent") ?? ink;
  const primary = svg(marks.primary);
  const compact = marks.symbol ? svg(marks.symbol) : primary;

  const grounds = (marks.on ?? []).map(({ ground: g, ink: k }) => ({
    ground: color(g),
    ink: color(k),
    ratio: contrast(color(g).hex, color(k).hex),
  }));

  const steps = type.wordmark
    ? [`Set in ${type.wordmark.family}, ${type.wordmark.setting}.`, ...type.wordmark.changes]
    : [];

  return (
    <section id="marks" className={styles.section} aria-labelledby="marks-title">
      <Heading id="marks" eyebrow="01 · Marks" title="Drawn once. Used as drawn.">
        {marks.primary.use}
      </Heading>

      <ul className={styles.bento}>
        <li className={`${styles.card} ${styles.wide}`} style={{ background: ink.hex, color: ground.hex }}>
          <div className={styles.cardArt}>
            <Mark className={styles.fit} svg={primary} label={brand.name} align="xMidYMid" />
          </div>
          <div className={styles.cardText}>
            <h3 className={styles.cardTitle}>{marks.primary.name}</h3>
            <p>{marks.primary.meaning ?? marks.primary.use}</p>
          </div>
        </li>
        {marks.symbol ? (
          <li className={styles.card} style={{ background: accent.hex, color: ground.hex }}>
            <div className={`${styles.cardArt} ${styles.square}`}>
              <Mark className={styles.fit} svg={compact} label={`${brand.name} ${marks.symbol.name}`} align="xMidYMid" />
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>{marks.symbol.name}</h3>
              <p>{marks.symbol.meaning ?? marks.symbol.use}</p>
            </div>
          </li>
        ) : null}
        {marks.alternates?.map((m) => (
          <li key={m.file} className={`${styles.card} ${styles.outlined}`}>
            <div className={`${styles.cardArt} ${styles.square}`}>
              <Mark className={styles.fit} svg={svg(m)} label={`${brand.name} ${m.name}`} align="xMidYMid" />
            </div>
            <div className={styles.cardText}>
              <h3 className={styles.cardTitle}>{m.name}</h3>
              <p>{m.use}</p>
            </div>
          </li>
        ))}
      </ul>

      {grounds.length ? (
        <>
          <h3 className={styles.subtitle}>Where they sit</h3>
          <ul className={styles.grounds}>
            {grounds.map(({ ground: g, ink: k, ratio }) => (
              <li key={`${g.name}-${k.name}`}>
                <div className={styles.groundTile} data-edge={g === ground || undefined} style={{ background: g.hex, color: k.hex }}>
                  <Mark className={styles.fit} svg={compact} label="" align="xMidYMid" />
                </div>
                <p className={styles.caption}>
                  {k.name} on {g.name} <span className={styles.quiet}>{ratio.toFixed(2)}:1</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {steps.length ? (
        <>
          <h3 className={styles.subtitle}>How the wordmark is drawn</h3>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step} className={styles.step}>
                <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <div className={styles.pair}>
        <div className={`${styles.card} ${styles.outlined} ${styles.spec}`}>
          <h3 className={styles.cardTitle}>Clear space</h3>
          <p>
            Keep {marks.clearSpace.basis} clear on every side, {marks.clearSpace.ratio} × the mark’s height.
          </p>
          <figure
            className={styles.clear}
            style={{ "--aspect": aspect(primary), "--ratio": marks.clearSpace.ratio } as CSSProperties}
          >
            <div className={styles.clearMark}>
              <Mark svg={primary} label="" />
            </div>
          </figure>
        </div>
        <div className={`${styles.card} ${styles.outlined} ${styles.spec}`}>
          <h3 className={styles.cardTitle}>Smallest size</h3>
          <p>
            On screen: {marks.minimumSize.screen}.{marks.minimumSize.print ? ` In print: ${marks.minimumSize.print}.` : ""}
          </p>
          <ul className={styles.sizes}>
            {[40, 24, 16].map((h) => (
              <li key={h} style={{ "--h": `${h}px` } as CSSProperties}>
                <span className={styles.quiet}>{h}</span>
                {marks.symbol ? <Mark className={styles.sized} svg={compact} label="" /> : null}
                <Mark className={styles.sized} svg={primary} label="" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {marks.misuse?.length ? (
        <>
          <h3 className={styles.subtitle}>Never</h3>
          <ul className={styles.nevers}>
            {marks.misuse.map((rule) => (
              <li key={rule} className={styles.never}>
                <span className={styles.cross} aria-hidden="true" />
                <p>{rule}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/** The palette as cards as wide as their share of a page, every value one click from the clipboard. */
export function Colors({ active }: Props) {
  const { colors } = active.brand;
  const hexes = colors.map((c) => c.hex);
  const ground = colors.find((c) => c.role === "ground")!;
  const ordered = [...colors].sort((a, b) => b.proportion - a.proportion);

  const pairs = colors
    .flatMap((a, i) => colors.slice(i + 1).map((b) => (a.proportion >= b.proportion ? ([a, b] as const) : ([b, a] as const))))
    .map(([back, fore]) => ({ back, fore, ratio: contrast(back.hex, fore.hex) }))
    .sort((x, y) => y.ratio - x.ratio);

  return (
    <section id="color" className={styles.section} aria-labelledby="color-title">
      <Heading id="color" eyebrow="02 · Color" title={`${colors.length} colors. One carries the page.`}>
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
                {ROLE_NAMES[c.role]} · {c.proportion}%
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

      <h3 className={styles.subtitle}>Pairs that read</h3>
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
                <span className={styles.quiet}>
                  {" "}
                  {ratio.toFixed(2)}:1 · {level ?? (graphicOnly ? "Graphics only" : "Never for text")}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {active.brand.printProfile && colors.some((c) => c.cmyk) ? (
        <p className={styles.footnote}>
          CMYK converted from sRGB with {active.brand.printProfile}. Approximate: proof before print. Pantone
          is matched by eye.
        </p>
      ) : null}
    </section>
  );
}

/** Each face as a specimen card, why they fit, then the scale set in the brand's own words. */
export function Type({ active }: Props) {
  const { brand, byRole } = active;
  const { type } = brand;
  const accent = byRole("accent") ?? byRole("ink")!;
  const ground = byRole("ground")!;
  const faces = (["display", "text", "mono"] as const)
    .map((key) => [key, type[key]] as const)
    .filter((entry): entry is readonly [TypeStyle["face"], Face] => entry[1] !== undefined);

  const sample = (step: TypeStyle, i: number) => {
    if (step.face === "display") return i === 0 ? brand.name.split(/[\s-]/)[0] : brand.category.name;
    if (step.id === "body") return brand.positioning;
    return step.use;
  };

  return (
    <section id="type" className={styles.section} aria-labelledby="type-title">
      <Heading id="type" eyebrow="03 · Typography" title={faces.map(([, f]) => f.family).join(" & ")}>
        {type.fit}
      </Heading>

      <ul className={styles.faces}>
        {faces.map(([key, face], i) => {
          const upper = type.scale.steps.filter((s) => s.face === key).every((s) => s.case === "upper");
          const lead = i === 0;
          return (
            <li
              key={key}
              className={`${styles.card} ${lead ? "" : styles.outlined} ${styles.face}`}
              style={{ fontFamily: FACE_FAMILY[key], ...(lead ? { background: accent.hex, color: ground.hex } : {}) }}
            >
              <p className={styles.faceKind}>{key === "display" ? "Display" : key === "text" ? "Text" : "Mono"}</p>
              <p className={styles.faceGlyph} style={{ fontWeight: face.weights.at(-1) }} aria-hidden="true">
                {upper ? "AG" : "Ag"}
              </p>
              <div className={styles.faceFoot}>
                <h3
                  className={styles.faceName}
                  style={{ fontWeight: face.weights.at(-1), textTransform: upper ? "uppercase" : undefined }}
                >
                  {face.family}
                </h3>
                <p className={styles.faceRole}>{face.role}</p>
                <p className={styles.faceWeights}>Weights {face.weights.join(", ")}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className={styles.subtitle}>The scale</h3>
      <ol className={`${styles.card} ${styles.outlined} ${styles.scale}`}>
        {type.scale.steps.map((step, i) => (
          <li key={step.id} className={styles.scaleRow}>
            <div className={styles.scaleMeta}>
              <p className={styles.scaleId}>{step.id}</p>
              <p className={styles.quiet}>{describeStep(step)}</p>
              <p className={styles.quiet}>{step.use}</p>
            </div>
            <p
              className={styles.scaleSample}
              style={
                {
                  "--size": `${step.size}px`,
                  "--mobile-size": `${step.mobileSize ?? step.size}px`,
                  fontFamily: FACE_FAMILY[step.face],
                  fontWeight: step.weight,
                  lineHeight: step.lineHeight,
                  letterSpacing: `${step.tracking}em`,
                  textTransform: textTransform(step.case),
                  fontFeatureSettings: step.features?.map((f) => `"${f}"`).join(", "),
                } as CSSProperties
              }
            >
              {sample(step, i)}
            </p>
          </li>
        ))}
      </ol>

      {type.rules.length ? (
        <ul className={styles.rules}>
          {type.rules.map((rule, i) => (
            <li key={rule} className={styles.step}>
              <span className={styles.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
              <p>{rule}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** How the brand writes: three lines it would write, and the ones it wouldn't. */
export function Voice({ active }: Props) {
  const { voice } = active.brand;
  if (!voice) return null;

  return (
    <section id="voice" className={styles.section} aria-labelledby="voice-title">
      <Heading id="voice" eyebrow="05 · Voice" title="Write this, not that.">
        {voice.traits?.map((t) => `${t.trait}: ${t.means.charAt(0).toLowerCase()}${t.means.slice(1)}`).join(" ")}
      </Heading>

      <ul className={styles.lines}>
        {voice.lines.slice(0, 3).map((line) => (
          <li key={line.do} className={styles.line}>
            <div className={`${styles.card} ${styles.write}`}>
              <p className={styles.verdict}>Write</p>
              <p className={styles.quote}>{line.do}</p>
            </div>
            <div className={`${styles.card} ${styles.outlined} ${styles.not}`}>
              <p className={styles.verdict}>Not</p>
              <p className={styles.quote}>
                <s>{line.dont}</s>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The last word: the sign-off and the wordmark, on the accent. */
export function Closing({ active }: Props) {
  const { brand, svg, byRole } = active;
  const accent = byRole("accent") ?? byRole("ink")!;
  const ground = byRole("ground")!;

  return (
    <footer className={styles.closing}>
      <div className={styles.closingPanel} style={{ background: accent.hex, color: ground.hex }}>
        <p className={styles.closingLine}>{brand.voice?.signoff ?? brand.positioning}</p>
        {brand.story?.mission ? <p className={styles.closingMission}>{brand.story.mission}</p> : null}
        <Mark className={styles.closingMark} svg={svg(brand.marks.primary)} label={brand.name} align="xMidYMid" />
      </div>
      <p className={styles.colophon}>
        <span>{brand.edition}</span>
        <a href="#top">Back to top</a>
      </p>
    </footer>
  );
}
