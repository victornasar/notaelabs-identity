import type { Metadata } from "next";
import { Specimen } from "@/components/specimen";
import { positioning } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Applications",
};

const sizes = [16, 32] as const;

export default function ApplicationsPage() {
  return (
    <>
      <h1>Applications</h1>
      <p className="lead">
        Six surfaces. The identity has to survive each one.
      </p>

      <Specimen decision="Engagement letter. The founder reads this before any visual system exists, so the voice has to hold on its own.">
        <article className="letter">
          <img className="lockup" src="/marks/notae-lockup.svg" alt="Notae Labs" />
          <p className="letter-to">For the founder</p>
          <p>
            The company has a product. It does not yet have an identity the
            team can use.
          </p>
          <p>
            We take the brief through to a living brand site. You read it with
            us. Afterward a designer, an engineer, or an agent implements from
            the same site.
          </p>
          <p>Start with the story. The files sit on the last page.</p>
          <p className="signoff">Notae Labs</p>
        </article>
      </Specimen>

      <Specimen decision="This site. Type, color, and layout have to hold on a real page.">
        <div className="mini-frame">
          <div className="mini">
            <div className="mini-nav">
              <img src="/marks/notae-logomark.svg" alt="" />
              <span className="here">Story</span>
              <span>Voice</span>
              <span>Marks</span>
            </div>
            <h2>Story</h2>
            <p className="lead">{positioning}</p>
          </div>
        </div>
      </Specimen>

      <Specimen decision="Avatar and favicon. The mark has to stay legible at 16 pixels.">
        <div className="sizes">
          {sizes.map((size) => (
            <figure key={`paper-${size}`}>
              <div className="size-stage">
                <img
                  src="/marks/notae-logomark.svg"
                  width={size}
                  height={size}
                  alt=""
                />
              </div>
              <span className="size-label">{size} on paper</span>
            </figure>
          ))}
          {sizes.map((size) => (
            <figure key={`ink-${size}`}>
              <div className="size-stage ink">
                <img
                  src="/marks/notae-logomark-on-ink.svg"
                  width={size}
                  height={size}
                  alt=""
                />
              </div>
              <span className="size-label">{size} on ink</span>
            </figure>
          ))}
        </div>
      </Specimen>

      <Specimen decision="Co-brand. The mark sits beside another brand without taking it over.">
        <div className="cobrand">
          <img className="lockup" src="/marks/notae-lockup.svg" alt="Notae Labs" />
          <div className="divider" aria-hidden="true" />
          <div className="client">
            <svg
              className="logomark"
              viewBox="0 0 64 64"
              width="52"
              height="52"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="6"
                width="52"
                height="52"
                fill="none"
                stroke="#171614"
                strokeWidth="4"
              />
              <rect x="18" y="18" width="28" height="28" fill="#171614" />
            </svg>
            <span>Client</span>
          </div>
        </div>
      </Specimen>

      <Specimen decision="Method cover. The mark introduces the skill, then the name of the work.">
        <article className="cover">
          <img
            className="logomark"
            src="/marks/notae-logomark.svg"
            alt=""
          />
          <img
            className="wordmark"
            src="/marks/notae-wordmark.svg"
            alt="Notae Labs"
          />
          <dl>
            <dt>logomark</dt>
            <dd>Four drafts, then the locked mark.</dd>
            <dt>wordmark</dt>
            <dd>Posture, then the locked name.</dd>
          </dl>
        </article>
      </Specimen>

      <Specimen decision="Email. The note sounds like the same person, only shorter.">
        <article className="email">
          <div className="email-meta">
            <span className="meta-label">To</span>
            <span>The founder</span>
            <span className="meta-label">Subject</span>
            <span>The site is ready</span>
          </div>
          <p>
            The site is ready. Read Story first, then Marks. Files and
            clear-space rules are on the last page.
          </p>
          <p className="signoff">Notae Labs</p>
        </article>
      </Specimen>
    </>
  );
}
