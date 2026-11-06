import { boardSlugs } from "@/lib/brand/route-board";

export default function RoutesIndex() {
  return (
    <main className="index">
      <p className="label">Routes in review</p>
      {boardSlugs.length ? (
        <ul>
          {boardSlugs.map((slug) => (
            <li key={slug}>
              <a href={`/routes/${slug}`}>{slug}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No brand has a work/strategy.ts yet. Run `/brand &lt;slug&gt;`, then `pnpm brands`.</p>
      )}
    </main>
  );
}
