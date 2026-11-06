import type { Metadata } from "next";
import { downloads } from "@/lib/identity";

export const metadata: Metadata = {
  title: "Rules and files",
};

export default function RulesAndFilesPage() {
  return (
    <>
      <h1>Rules and files</h1>
      <p className="lead">
        The instructions are short. The files are the ones on this page.
      </p>

      <h2>Rules</h2>
      <ul className="rules">
        <li>Set the wordmark on one line.</li>
        <li>
          Keep clear space equal to the height of the capital N on every side.
        </li>
        <li>Use the logomark at 16 pixels and above.</li>
        <li>Use the wordmark at 32 pixels of height and above.</li>
        <li>Set the marks in ink, or in paper when they sit on ink.</li>
        <li>Use the signal for a decision: the current section, a link, a focus state.</li>
        <li>Print text and rules in black, 0 0 0 100.</li>
        <li>Print large ink fields as 30 20 20 100.</li>
        <li>Print secondary text as 0 0 0 70, on paper only.</li>
        <li>Print the signal as 90 65 0 0.</li>
        <li>Leave the dark signal on screen.</li>
      </ul>

      <h2>Files</h2>
      <p>
        PNG heights are the height of the art in pixels. SVG and PDF are
        vector. The color table is a text file.
      </p>
      <div className="downloads">
        {downloads.map((group) => (
          <section key={group.group}>
            <h2>{group.group}</h2>
            <ul>
              {group.files.map(([label, href]) => (
                <li key={href}>
                  <a href={href} download>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
