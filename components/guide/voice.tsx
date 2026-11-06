import styles from "./voice.module.css";
import { Heading } from "./ui/heading";
import type { SectionProps } from "./ui/types";
import ui from "./ui/ui.module.css";

/** How the brand writes: three lines it would write, and the ones it wouldn't. */
export function Voice({ active, section }: SectionProps) {
  const { voice, page } = active.brand;
  if (!voice) return null;

  return (
    <section id="voice" className={`${ui.container} ${ui.section}`} aria-labelledby="voice-title">
      <Heading section={section} title={page?.titles?.voice ?? "Write this, not that."}>
        {voice.traits?.map((t) => `${t.trait}: ${t.means.charAt(0).toLowerCase()}${t.means.slice(1)}`).join(" ")}
      </Heading>

      <ul className={styles.lines}>
        {voice.lines.slice(0, 3).map((line) => (
          <li key={line.do} className={styles.line}>
            <div className={`${ui.card} ${styles.write}`}>
              <p className={styles.verdict}>Write</p>
              <p className={styles.quote}>{line.do}</p>
            </div>
            <div className={`${ui.card} ${ui.outlined} ${styles.not}`}>
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
