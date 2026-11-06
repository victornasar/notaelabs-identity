import type { Metadata } from "next";
import { Specimen } from "@/components/specimen";

export const metadata: Metadata = {
  title: "Voice",
};

export default function VoicePage() {
  return (
    <>
      <h1>Voice</h1>
      <p className="lead">Direct. Specific. Brief.</p>
      <p>
        Story pages declare. Rules give an instruction. Emails sound like the
        same person, only shorter.
      </p>

      <Specimen decision="Email. The note sounds like the same person, only shorter.">
        <p>
          The site is ready. Read Story first, then Marks. Files and
          clear-space rules are on the last page.
        </p>
      </Specimen>

      <Specimen decision="Rule. One instruction, then the measure.">
        <p>
          Set the wordmark on one line. Keep clear space equal to the height
          of the capital N on every side.
        </p>
      </Specimen>

      <Specimen decision="Application caption. Name the surface, then the decision.">
        <p>
          Engagement letter. The founder reads this before any visual system
          exists, so the voice has to hold on its own.
        </p>
      </Specimen>
    </>
  );
}
