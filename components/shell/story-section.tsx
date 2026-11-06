import type { ActiveBrand } from "@/lib/brand/active";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./story-section.module.css";

const VERDICTS = { keep: "Keep", evolve: "Evolve", drop: "Drop", reject: "Reject" } as const;

/** Why the brand looks the way it does: the idea, who it is for, and what it refuses. */
export function StorySection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand } = active;
  const { concept, category, equity, story } = brand;
  const identity = (name: string) => category.identities?.find((i) => i.name === name)?.identity;

  const rows: [string, React.ReactNode][] = [
    ["Source", concept.source],
    ...(story?.mission ? [["Mission", story.mission] as [string, string]] : []),
    ...(story?.vision ? [["Vision", story.vision] as [string, string]] : []),
    ...(story ? [["Audience", story.audience] as [string, string]] : []),
    ...(story?.refuses ? [["Refuses", story.refuses] as [string, string]] : []),
    ...(story?.archetype ? [["Archetype", story.archetype] as [string, string]] : []),
  ];

  return (
    <section id="story" className={book.section} aria-labelledby="story-title">
      <SectionHeader id="story" number={number} title="Story" />

      <p className={`grid ${styles.idea}`}>
        <span className={`label ${styles.ideaLabel}`}>The idea</span>
        <span className={styles.ideaText}>{concept.idea}</span>
      </p>

      <ul className={book.rows}>
        {rows.map(([label, body]) => (
          <li key={label} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>{label}</p>
            <p className={book.rowBody}>{body}</p>
          </li>
        ))}
      </ul>

      {story?.personality.length ? (
        <div className={`grid ${styles.personality}`}>
          <p className={`label ${book.subLabel}`}>Personality</p>
          <ul className={styles.words}>
            {story.personality.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {story?.values?.length ? (
        <>
          <Subhead label="Values" title="What the work holds to" />
          <ul className={book.rows}>
            {story.values.map((v) => (
              <li key={v.value} className={`grid ${book.row}`}>
                <p className={book.rowLabel}>{v.value}</p>
                <p className={book.rowBody}>{v.means}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Subhead label="Built from" title="Primitives">
        Every mark, device and layout is built from these shapes.
      </Subhead>
      <ul className={book.rows}>
        {concept.primitives.map((p) => (
          <li key={p.id} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>{p.id}</p>
            <div className={book.rowBody}>
              <p>{p.shape}</p>
              <p className={book.quiet}>{p.from}</p>
            </div>
          </li>
        ))}
      </ul>

      <Subhead label="Category" title={category.name}>
        Shortlisted against {listOf(category.competitors)}. What the category does, and what this
        brand does instead.
      </Subhead>
      {category.identities?.length ? (
        <ul className={`${book.rows} ${styles.competitors}`}>
          {category.competitors.map((name) => (
            <li key={name} className={`grid ${book.row}`}>
              <p className={book.rowLabel}>{name}</p>
              <p className={book.rowBody}>{identity(name) ?? "Not described."}</p>
            </li>
          ))}
        </ul>
      ) : null}
      <ul className={book.rows}>
        {category.conventions.map((c) => (
          <li key={c.id} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>
              <span className={book.tag} data-strong={c.verdict === "reject" || undefined}>
                {VERDICTS[c.verdict]}
              </span>
            </p>
            <div className={book.rowBody}>
              <p>{c.convention}</p>
              <p className={book.quiet}>{c.why}</p>
            </div>
          </li>
        ))}
      </ul>

      {equity.status !== "greenfield" ? (
        <>
          <Subhead label="Equity" title="What carries over">
            {equity.status === "refresh"
              ? "A refresh: the earlier identity keeps what it earned."
              : "A replacement: the earlier identity is retired."}
          </Subhead>
          <ul className={book.rows}>
            {equity.assets.map((a) => (
              <li key={a.id} className={`grid ${book.row}`}>
                <p className={`label ${book.rowLabel}`}>
                  <span className={book.tag} data-strong={a.verdict === "keep" || undefined}>
                    {VERDICTS[a.verdict]}
                  </span>
                </p>
                <div className={book.rowBody}>
                  <p>{a.asset}</p>
                  <p className={book.quiet}>{a.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function listOf(names: string[]) {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}
