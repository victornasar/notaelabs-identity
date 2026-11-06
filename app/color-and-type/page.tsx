import type { Metadata } from "next";
import { colors, contrast } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Color and type",
};

export default function ColorAndTypePage() {
  return (
    <>
      <h1>Color and type</h1>
      <p className="lead">
        Printed matter, plus an editor’s pencil. CSS uses OKLCH. Files use
        hex. Print uses process recipes.
      </p>

      <ul className="swatches">
        {colors.map((color) => (
          <li key={color.name} className="swatch-row">
            <div
              className="swatch"
              style={{
                background: "ground" in color && color.ground ? color.ground : color.swatch,
              }}
            >
              {"ground" in color && color.ground ? (
                <span className="swatch-chip" style={{ background: color.swatch }} />
              ) : null}
            </div>
            <div className="swatch-copy">
              <h3>{color.name}</h3>
              <p className="mono">{color.oklch}</p>
              <p className="mono">{color.hex}</p>
              <p>{color.print}</p>
            </div>
          </li>
        ))}
      </ul>

      <h2>Contrast</h2>
      <p>Calculated in sRGB. Text pairs meet WCAG AA.</p>
      <ul className="contrast">
        {contrast.map(([pair, ratio]) => (
          <li key={pair}>
            <span>{pair}</span>
            <span>{ratio}</span>
          </li>
        ))}
      </ul>

      <h2>Type</h2>
      <p className="type-display">Exact. Plain. Calm.</p>
      <p className="type-note">Source Serif 4. Statements and page titles.</p>
      <p>
        We speak like a senior maker sitting with a founder. Warmth shows up
        as clarity.
      </p>
      <p className="type-note">IBM Plex Sans. Interface, rules, and captions.</p>
      <p className="mono">oklch(47.31% 0.223 265.82)</p>
      <p className="type-note">IBM Plex Mono. Color values and file names.</p>
      <p className="pair">
        The wordmark is a separate drawing. Source Serif 4 is the text face,
        and it is not the logo.
      </p>
    </>
  );
}
