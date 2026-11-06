import type { ActiveBrand } from "@/lib/brand/active";
import { physicalKinds } from "@/lib/brand/schema";
import { Mark } from "./mark";
import { SectionHeader } from "./section-header";
import { Subhead } from "./subhead";
import book from "./book.module.css";
import styles from "./device-section.module.css";

const KIND_NAMES: Record<string, string> = {
  website: "Website",
  "business-card": "Business card",
  letterhead: "Letterhead",
  "email-signature": "Email signature",
  "social-post": "Social post",
  deck: "Deck",
  signage: "Signage",
  poster: "Poster",
  "app-icon": "App icon",
  dashboard: "Dashboard",
};

/** The brand's one graphic device, its rules, and where it goes in print and on screen. */
export function DeviceSection({ active, number }: { active: ActiveBrand; number: number }) {
  const { brand, color, graphic } = active;
  const { device } = brand;
  if (!device) return null;

  return (
    <section id="device" className={book.section} aria-labelledby="device-title">
      <SectionHeader id="device" number={number} title={device.name}>
        <p>{device.construction}</p>
      </SectionHeader>

      <div
        className={styles.field}
        data-edge={color(device.ground).role === "ground" || undefined}
        style={{ background: color(device.ground).hex, color: color(device.ink).hex }}
      >
        <Mark className={styles.drawing} svg={graphic(device.file)} label="" align="xMidYMid" />
      </div>

      <ul className={book.rows}>
        {device.rules.map((rule, i) => (
          <li key={rule} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>{String(i + 1).padStart(2, "0")}</p>
            <p className={book.rowBody}>{rule}</p>
          </li>
        ))}
      </ul>

      <Subhead label="In use" title="In print and on screen">
        {device.use}
      </Subhead>
      <ul className={book.rows}>
        {device.applications.map((app) => (
          <li key={app.kind} className={`grid ${book.row}`}>
            <p className={`label ${book.rowLabel}`}>{physicalKinds.includes(app.kind) ? "Print" : "Screen"}</p>
            <div className={book.rowBody}>
              <p>{KIND_NAMES[app.kind]}</p>
              <p className={book.quiet}>{app.why}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
