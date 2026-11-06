import type { ActiveBrand } from "@/lib/brand/active";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./voice-section.module.css";

/** How the brand writes: its traits, with lines and rewrites that show them. */
export function VoiceSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { voice } = active.brand;
  if (!voice) return null;

  return (
    <section id="voice" className={book.section} aria-labelledby="voice-title">
      <SectionHeader id="voice" number={number} title="Voice">
        <p>{voice.traits.map((t) => t.trait).join(" and ")}. Every line is held to both.</p>
      </SectionHeader>

      <ul className={styles.traits}>
        {voice.traits.map((t) => (
          <li key={t.trait} className={`grid ${styles.trait}`}>
            <h3 className={styles.traitName}>{t.trait}</h3>
            <div className={styles.meaning}>
              <p className={`label ${book.quiet}`}>Means</p>
              <p>{t.means}</p>
            </div>
            <div className={styles.meaning}>
              <p className={`label ${book.quiet}`}>Doesn’t mean</p>
              <p>{t.doesNotMean}</p>
            </div>
          </li>
        ))}
      </ul>

      {voice.lines.length ? (
        <>
          <Subhead label="Lines" title="Write this, not that" />
          <ul className={book.rows}>
            {voice.lines.map((line) => (
              <li key={line.do} className={`grid ${book.row} ${styles.pair}`}>
                <div className={styles.do}>
                  <p className={`label ${book.quiet}`}>Write</p>
                  <p className={styles.quote}>{line.do}</p>
                </div>
                <div className={styles.dont}>
                  <p className={`label ${book.quiet}`}>Not</p>
                  <p className={styles.quote}>
                    <s>{line.dont}</s>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {voice.rewrites.length ? (
        <>
          <Subhead label="Rewrites" title="Before and after" />
          <ul className={book.rows}>
            {voice.rewrites.map((r) => (
              <li key={r.before} className={`grid ${book.row} ${styles.pair}`}>
                <div className={styles.dont}>
                  <p className={`label ${book.quiet}`}>Before</p>
                  <p className={styles.quote}>{r.before}</p>
                </div>
                <div className={styles.do}>
                  <p className={`label ${book.quiet}`}>After</p>
                  <p className={styles.quote}>{r.after}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
