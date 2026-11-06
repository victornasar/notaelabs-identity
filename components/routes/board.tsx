import type { CSSProperties, ReactNode } from "react";
import { Mark } from "@/components/shell/mark";
import { contrast } from "@/lib/brand/color";
import type { BoardRoute, getBoard } from "@/lib/brand/route-board";
import type { Case, TypeStyle } from "@/lib/brand/schema";
import styles from "./board.module.css";

type Board = NonNullable<ReturnType<typeof getBoard>>;

const ROWS = ["Marks", "Palette", "Type", "App tile", "Website hero", "Business card", "Score"] as const;

const transform: Record<Case, CSSProperties["textTransform"]> = {
  sentence: "none",
  title: "none",
  "as-written": "none",
  upper: "uppercase",
  lower: "lowercase",
};

/** Inline style for one step of a route's type scale, at a given size. */
function styleFor(r: BoardRoute, step: TypeStyle, fontSize: string): CSSProperties {
  return {
    fontFamily: r.family(step.face),
    fontSize,
    fontWeight: step.weight,
    lineHeight: step.lineHeight,
    letterSpacing: `${step.tracking}em`,
    textTransform: transform[step.case],
    fontFeatureSettings: step.features?.map((f) => `"${f}"`).join(", ") || undefined,
  };
}

function fontCss(board: Board) {
  const seen = new Set<string>();
  return board.routes
    .flatMap((r) => r.fonts)
    .filter((f) => !seen.has(f.src) && seen.add(f.src))
    .map(
      (f) =>
        `@font-face{font-family:"${f.family}";src:url("${f.src}");font-weight:${f.weight};font-style:${f.style};font-display:block}`,
    )
    .join("\n");
}

export function Board({ board }: { board: Board }) {
  const { strategy } = board;
  return (
    <>
      <style>{fontCss(board)}</style>
      <header className={styles.header}>
        <p className="label">
          {board.slug} · routes{board.picked ? ` · picked ${board.picked.toUpperCase()}` : ""}
        </p>
        <h1 className={styles.idea}>{strategy.concept.idea}</h1>
        <dl className={styles.strategy}>
          <div>
            <dt className="label">Primitives</dt>
            {strategy.concept.primitives.map((p) => (
              <dd key={p.id}>
                <code>{p.id}</code> {p.shape}
              </dd>
            ))}
          </div>
          <div>
            <dt className="label">Rejects</dt>
            {strategy.category.conventions
              .filter((c) => c.verdict === "reject")
              .map((c) => (
                <dd key={c.id}>
                  <code>{c.id}</code> {c.convention}
                </dd>
              ))}
          </div>
          <div>
            <dt className="label">Equity · {strategy.equity.status}</dt>
            {strategy.equity.assets.map((a) => (
              <dd key={a.id}>
                <code>{a.verdict}</code> {a.asset}
              </dd>
            ))}
          </div>
        </dl>
      </header>
      <main className={styles.grid} style={{ "--count": board.routes.length } as CSSProperties}>
        {board.routes.map((r) => (
          <RouteColumn key={r.route.letter} r={r} picked={board.picked === r.route.letter} />
        ))}
      </main>
    </>
  );
}

function Cell({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${styles.cell} ${className ?? ""}`}>
      <h3 className="label">{label}</h3>
      {children}
    </section>
  );
}

function RouteColumn({ r, picked }: { r: BoardRoute; picked: boolean }) {
  const { route } = r;
  return (
    <article className={styles.column} data-picked={picked || undefined}>
      <header className={styles.head}>
        <p className="label">
          Route {route.letter.toUpperCase()}
          {picked ? " · picked" : ""}
        </p>
        <h2>{route.name}</h2>
        <p>{route.idea}</p>
      </header>
      {r.problems.length ? (
        <section className={`${styles.cell} ${styles.sentBack}`}>
          <h3 className="label">Sent back · not for review</h3>
          <ul>
            {r.problems.map((p) => (
              <li key={p}>{p.replace(/^route [A-C]: /, "")}</li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <Marks r={r} />
          <Palette r={r} />
          <Specimen r={r} />
          <Tile r={r} />
          <Hero r={r} />
          <Card r={r} />
          <ScoreCard r={r} />
        </>
      )}
    </article>
  );
}

function surface(r: BoardRoute, ground: string, ink: string): CSSProperties {
  return { background: r.color(ground), color: r.color(ink) };
}

function Marks({ r }: { r: BoardRoute }) {
  const { marks, colors } = r.route;
  const ground = colors.find((c) => c.role === "ground")!.name;
  const ink = colors.find((c) => c.role === "ink")!.name;
  const lockup = marks.alternates?.find((m) => /lockup/i.test(`${m.file} ${m.name}`)) ?? marks.primary;
  const small = [marks.symbol, marks.primary].filter((m) => m !== undefined);
  return (
    <Cell label={ROWS[0]}>
      <div className={styles.marks} style={surface(r, ground, ink)}>
        {small.map((m) => (
          <div key={m.file} className={styles.sizes}>
            {[16, 64].map((size) => (
              <figure key={size} style={{ "--h": `${size}px` } as CSSProperties}>
                <Mark svg={r.svg[m.file] ?? ""} label={`${m.name}, ${size}px`} className={styles.mark} align="xMinYMid" />
                <figcaption className="label">
                  {m.name} {size}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
        <figure className={styles.lockup}>
          <Mark svg={r.svg[lockup.file] ?? ""} label={lockup.name} className={styles.mark} align="xMinYMid" />
          <figcaption className="label">{lockup.name}</figcaption>
        </figure>
      </div>
    </Cell>
  );
}

function Palette({ r }: { r: BoardRoute }) {
  const { colors } = r.route;
  return (
    <Cell label={ROWS[1]}>
      <div className={styles.bar}>
        {colors.map((c) => (
          <span key={c.name} style={{ flexGrow: c.proportion, background: c.hex }} title={`${c.name} ${c.proportion}%`} />
        ))}
      </div>
      <ul className={styles.swatches}>
        {colors.map((c) => (
          <li key={c.name}>
            <span className={styles.chip} style={{ background: c.hex }} />
            <span>
              <strong>{c.name}</strong> <span className="label">{c.role} · {c.proportion}%</span>
              <br />
              <span className="label">
                {c.hex} {c.oklch ? `· ${c.oklch}` : ""}
              </span>
              {c.pairs?.map((p) => (
                <span key={p.on} className={`label ${styles.pair}`}>
                  on {p.on} {contrast(c.hex, r.color(p.on)).toFixed(1)}:1 {p.as}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Cell>
  );
}

function Specimen({ r }: { r: BoardRoute }) {
  const { type, applications } = r.route;
  const faces = [type.display, type.text, type.mono].filter((f) => f !== undefined);
  return (
    <Cell label={ROWS[2]}>
      <p className="label">{faces.map((f) => `${f.family} ${f.weights.join("/")}`).join(" · ")}</p>
      {type.wordmark ? (
        <p className="label">
          Wordmark from {type.wordmark.family}, {type.wordmark.setting}
          {type.wordmark.changes.length ? `: ${type.wordmark.changes.join("; ")}` : ", unchanged"}
        </p>
      ) : null}
      <ol className={styles.steps}>
        {type.scale.steps.map((step) => {
          const shown = Math.min(step.size, 56);
          const sample = step.face === "display" ? applications.hero.headline : applications.hero.sub;
          return (
            <li key={step.id}>
              <p className="label">
                {step.id} · {step.size}px{shown < step.size ? ` (shown ${shown})` : ""} / {step.lineHeight} · {step.weight} ·{" "}
                {step.tracking}em · {step.case}
              </p>
              <p style={styleFor(r, step, `${shown}px`)}>{sample}</p>
            </li>
          );
        })}
      </ol>
      <ul className={styles.rules}>
        {type.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </Cell>
  );
}

function Tile({ r }: { r: BoardRoute }) {
  const { tile } = r.route.applications;
  return (
    <Cell label={ROWS[3]}>
      <div className={styles.tiles}>
        {[120, 60, 29].map((size) => (
          <div key={size} className={styles.tile} style={{ ...surface(r, tile.ground, tile.ink), width: size, height: size }}>
            <Mark svg={r.svg[tile.mark] ?? ""} label={`App tile, ${size}px`} className={styles.mark} align="xMidYMid" />
          </div>
        ))}
      </div>
    </Cell>
  );
}

function Hero({ r }: { r: BoardRoute }) {
  const { hero } = r.route.applications;
  const steps = r.route.type.scale.steps;
  const head = steps.find((s) => s.face === "display") ?? steps[0];
  const body = steps.find((s) => s.face === "text") ?? steps.at(-1)!;
  // The hero is a 1280px-wide page scaled to the column; sizes are in that page's px.
  const px = (size: number) => `calc(${size} / 1280 * 100cqi)`;
  return (
    <Cell label={ROWS[4]}>
      <div className={styles.hero} style={surface(r, hero.ground, hero.ink)}>
        <div className={styles.heroBar}>
          <Mark svg={r.svg[r.route.marks.primary.file] ?? ""} label="" className={styles.mark} align="xMinYMid" />
        </div>
        <p style={styleFor(r, head, px(Math.min(head.size, 112)))}>{hero.headline}</p>
        <p style={{ ...styleFor(r, body, px(Math.max(body.size, 20))), maxWidth: "60%" }}>{hero.sub}</p>
        <span
          className={styles.action}
          style={{ ...styleFor(r, body, px(18)), background: r.color(hero.ink), color: r.color(hero.ground) }}
        >
          {hero.action}
        </span>
      </div>
    </Cell>
  );
}

function Card({ r }: { r: BoardRoute }) {
  const { card } = r.route.applications;
  const { marks, type } = r.route;
  return (
    <Cell label={ROWS[5]}>
      <div className={styles.card} style={{ ...surface(r, card.ground, card.ink), fontFamily: r.family("text") }}>
        <div className={styles.cardMark}>
          <Mark svg={r.svg[(marks.symbol ?? marks.primary).file] ?? ""} label="" className={styles.mark} align="xMinYMid" />
        </div>
        <div className={styles.cardText}>
          <p style={{ fontWeight: Math.max(...type.text.weights) }}>{card.name}</p>
          <p>{card.title}</p>
          {card.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </Cell>
  );
}

function ScoreCard({ r }: { r: BoardRoute }) {
  if (!r.scores) {
    return (
      <Cell label={ROWS[6]}>
        <p className="label">Not scored yet.</p>
      </Cell>
    );
  }
  const { rows, strongest, weakest } = r.scores;
  const total = rows.reduce((sum, row) => sum + (row.score ?? 0), 0);
  return (
    <Cell label={`${ROWS[6]} · ${total}/${rows.length * 3}`}>
      <table className={styles.scores}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.criterion}>
              <th scope="row">{row.criterion}</th>
              <td aria-label={`${row.score ?? "unscored"} of 3`}>
                {[1, 2, 3].map((n) => (
                  <span key={n} className={styles.dot} data-on={(row.score ?? 0) >= n || undefined} />
                ))}
              </td>
              <td>{row.evidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {strongest ? <p><span className="label">Strongest</span> {strongest}</p> : null}
      {weakest ? <p><span className="label">Weakest</span> {weakest}</p> : null}
    </Cell>
  );
}
