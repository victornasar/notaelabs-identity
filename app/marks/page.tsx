import type { Metadata } from "next";
import { Specimen } from "@/components/specimen";

export const metadata: Metadata = {
  title: "Marks",
};

export default function MarksPage() {
  return (
    <>
      <h1>Marks</h1>
      <p className="lead">
        The name is a drawing. The symbol is a registration mark.
      </p>

      <Specimen decision="Primary wordmark. Notae Labs, one line, drawn.">
        <img
          className="wordmark"
          src="/marks/notae-wordmark.svg"
          alt="Notae Labs wordmark"
        />
      </Specimen>

      <Specimen decision="Short wordmark. Notae, where the full name will not fit.">
        <img
          className="short-mark"
          src="/marks/notae-wordmark-short.svg"
          alt="Notae wordmark"
        />
      </Specimen>

      <Specimen decision="Logomark. A circle and a cross. Legible at 16 pixels, in one color.">
        <img
          className="logomark"
          src="/marks/notae-logomark.svg"
          alt="Notae Labs logomark"
        />
      </Specimen>

      <Specimen decision="Lockup. The symbol, then the name.">
        <img
          className="lockup"
          src="/marks/notae-lockup.svg"
          alt="Notae Labs lockup"
        />
      </Specimen>

      <Specimen decision="On ink. The marks reverse to paper.">
        <div className="ink-ground">
          <img
            src="/marks/notae-lockup-on-ink.svg"
            alt="Notae Labs lockup reversed to paper on ink"
          />
        </div>
      </Specimen>

      <Specimen decision="Clear space. Equal to the height of the capital N on every side. The signal line is the boundary.">
        <div className="clearspace">
          <img src="/marks/notae-wordmark.svg" alt="" />
        </div>
      </Specimen>

      <h2>Misuse</h2>
      <ul className="misuse-grid">
        <li>
          <figure>
            <div className="stage">
              <img
                className="wordmark stretched"
                src="/marks/notae-wordmark.svg"
                alt=""
              />
            </div>
            <figcaption>
              <span className="misuse-label">Misuse. </span>
              The wordmark is stretched.
            </figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <div className="stage">
              <div className="misuse-signal" />
            </div>
            <figcaption>
              <span className="misuse-label">Misuse. </span>
              The logomark is set in the signal color.
            </figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <div className="stage">
              <div className="cramped">
                <img src="/marks/notae-wordmark.svg" alt="" />
              </div>
            </div>
            <figcaption>
              <span className="misuse-label">Misuse. </span>
              Clear space is collapsed.
            </figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <div className="stage">
              <img className="tilted" src="/marks/notae-logomark.svg" alt="" />
            </div>
            <figcaption>
              <span className="misuse-label">Misuse. </span>
              The logomark is rotated.
            </figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <div className="stage">
              <p className="impostor">Notae Labs</p>
            </div>
            <figcaption>
              <span className="misuse-label">Misuse. </span>
              The text face is not the wordmark.
            </figcaption>
          </figure>
        </li>
      </ul>
    </>
  );
}
