import type { CSSProperties } from "react";
import { Mark } from "@/components/shell/mark";
import { contrast } from "@/lib/brand/color";
import { aspect } from "@/lib/brand/svg";
import styles from "./marks.module.css";
import { Heading } from "./ui/heading";
import type { SectionProps } from "./ui/types";
import ui from "./ui/ui.module.css";

/** Every mark as a card, the grounds they sit on, and how the wordmark was drawn. */
export function Marks({ active, section }: SectionProps) {
  const { brand, svg, roles, color } = active;
  const { marks, type } = brand;
  const { ground, ink, accent } = roles;
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
    <section id="marks" className={`${ui.container} ${ui.section}`} aria-labelledby="marks-title">
      <Heading section={section} title={brand.page?.titles?.marks ?? "Marks"}>
        {marks.primary.use}
      </Heading>

      <ul className={styles.bento}>
        <li className={`${ui.card} ${styles.wide}`} style={{ background: ink.hex, color: ground.hex }}>
          <div className={`${ui.cardArt} ${styles.wideArt}`}>
            <Mark className={ui.fit} svg={primary} label={brand.name} align="xMidYMid" />
          </div>
          <div className={ui.cardText}>
            <h3 className={ui.cardTitle}>{marks.primary.name}</h3>
            <p>{marks.primary.meaning ?? marks.primary.use}</p>
          </div>
        </li>
        {marks.symbol ? (
          <li className={ui.card} style={{ background: accent.hex, color: ground.hex }}>
            <div className={`${ui.cardArt} ${ui.square}`}>
              <Mark className={ui.fit} svg={compact} label={`${brand.name} ${marks.symbol.name}`} align="xMidYMid" />
            </div>
            <div className={ui.cardText}>
              <h3 className={ui.cardTitle}>{marks.symbol.name}</h3>
              <p>{marks.symbol.meaning ?? marks.symbol.use}</p>
            </div>
          </li>
        ) : null}
        {marks.alternates?.map((m) => (
          <li key={m.file} className={`${ui.card} ${ui.outlined}`}>
            <div className={`${ui.cardArt} ${ui.square}`}>
              <Mark className={ui.fit} svg={svg(m)} label={`${brand.name} ${m.name}`} align="xMidYMid" />
            </div>
            <div className={ui.cardText}>
              <h3 className={ui.cardTitle}>{m.name}</h3>
              <p>{m.use}</p>
            </div>
          </li>
        ))}
      </ul>

      {grounds.length ? (
        <>
          <h3 className={ui.subtitle}>Where they sit</h3>
          <ul className={styles.grounds}>
            {grounds.map(({ ground: g, ink: k, ratio }) => (
              <li key={`${g.name}-${k.name}`}>
                <div className={styles.groundTile} data-edge={g === ground || undefined} style={{ background: g.hex, color: k.hex }}>
                  <Mark className={ui.fit} svg={compact} label="" align="xMidYMid" />
                </div>
                <p className={ui.caption}>
                  {k.name} on {g.name} <span className={ui.quiet}>{ratio.toFixed(2)}:1</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {steps.length ? (
        <>
          <h3 className={ui.subtitle}>How the wordmark is drawn</h3>
          <ol className={ui.steps}>
            {steps.map((step, i) => (
              <li key={step} className={ui.step}>
                <span className={ui.stepNumber}>{String(i + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <div className={styles.pair}>
        <div className={`${ui.card} ${ui.outlined} ${styles.spec}`}>
          <h3 className={ui.cardTitle}>Clear space</h3>
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
        <div className={`${ui.card} ${ui.outlined} ${styles.spec}`}>
          <h3 className={ui.cardTitle}>Smallest size</h3>
          <p>
            On screen: {marks.minimumSize.screen}.{marks.minimumSize.print ? ` In print: ${marks.minimumSize.print}.` : ""}
          </p>
          <ul className={styles.sizes}>
            {[40, 24, 16].map((h) => (
              <li key={h} style={{ "--h": `${h}px` } as CSSProperties}>
                <span className={ui.quiet}>{h}</span>
                {marks.symbol ? <Mark className={styles.sized} svg={compact} label="" /> : null}
                <Mark className={styles.sized} svg={primary} label="" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {marks.misuse?.length ? (
        <>
          <h3 className={ui.subtitle}>Never</h3>
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
