import type { Metadata } from "next";
import { positioning } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Story",
};

export default function StoryPage() {
  return (
    <>
      <h1>Story</h1>
      <p className="lead">{positioning}</p>

      <h2>Who it is for</h2>
      <p>
        The reader is a founder whose company already has a product and does
        not yet have an identity the team can use. One person sits in the
        meeting. Afterward a designer, an engineer, or an agent implements
        from the site.
      </p>

      <h2>Personality</h2>
      <ul className="traits">
        <li>Exact.</li>
        <li>Plain.</li>
        <li>Calm.</li>
      </ul>
      <p>
        We speak like a senior maker sitting with a founder. Warmth shows up
        as clarity.
      </p>

      <h2>What we refuse</h2>
      <p>Hype. Mystique. Decoration that does not carry a decision.</p>

      <h2>How the marks are made</h2>
      <p>
        Two skills draw the marks. logomark runs four drafts, then locks the
        symbol. wordmark sets the posture, then locks the name. The method
        cover shows both.
      </p>
    </>
  );
}
