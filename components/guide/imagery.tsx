import type { CSSProperties } from "react";
import { Mark } from "@/components/shell/mark";
import { kindNames } from "@/lib/brand/labels";
import { physicalKinds, type Application } from "@/lib/brand/schema";
import styles from "./imagery.module.css";
import { DeviceRow } from "./ui/device-row";
import { Heading } from "./ui/heading";
import type { SectionProps } from "./ui/types";
import ui from "./ui/ui.module.css";

const text = (copy: Application["copy"], key: string) => {
  const value = copy[key];
  return typeof value === "string" ? value : undefined;
};
const lines = (copy: Application["copy"]) => (Array.isArray(copy.lines) ? copy.lines : []);

/** The identity at work: each of the device's applications, drawn as the thing itself. */
export function Imagery({ active, section }: SectionProps) {
  const { brand, color, svg } = active;
  const { device, marks } = brand;
  if (!device?.applications.length) return null;
  const { accent } = active.roles;
  const lockup = svg(marks.alternates?.[0] ?? marks.primary);
  const wordmark = svg(marks.primary);
  const symbol = marks.symbol ? svg(marks.symbol) : wordmark;
  // The social handle is the domain's name, or the brand's own name without one.
  const handle = brand.domain?.replace(/\..*$/, "") ?? brand.name;

  const scene = (app: Application) => {
    const surface = { background: color(app.ground).hex, color: color(app.ink).hex } as CSSProperties;
    const headline = text(app.copy, "headline");

    switch (app.kind) {
      case "signage":
        return (
          <div className={styles.signage} style={surface}>
            <Mark className={styles.signageMark} svg={lockup} label="" align="xMinYMid" />
            <p className={styles.headline}>{headline}</p>
            <ul className={styles.small}>
              {lines(app.copy).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <DeviceRow active={active} className={styles.foot} />
          </div>
        );
      case "business-card":
        return (
          <div className={styles.cards}>
            <div className={`${styles.card} ${styles.front}`} style={surface}>
              <Mark className={styles.cardMark} svg={wordmark} label="" align="xMinYMid" />
              <DeviceRow active={active} className={styles.foot} />
            </div>
            <div className={`${styles.card} ${styles.back}`} style={surface}>
              <Mark className={styles.cardSymbol} style={{ color: accent.hex }} svg={symbol} label="" align="xMinYMid" />
              <div>
                <p className={styles.person}>{text(app.copy, "name")}</p>
                <p className={styles.role}>{text(app.copy, "role")}</p>
                <ul className={styles.small}>
                  {lines(app.copy).map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case "website":
        return (
          <div className={styles.browser}>
            <div className={styles.chrome} aria-hidden="true">
              <span />
              <span />
              <span />
              {brand.domain ? <p>{brand.domain}</p> : null}
            </div>
            <div className={styles.site} style={surface}>
              <div className={styles.siteNav}>
                <Mark className={styles.siteMark} svg={lockup} label="" align="xMinYMid" />
                <ul>
                  {lines(app.copy).map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
              <p className={styles.headline}>{headline}</p>
              <DeviceRow active={active} className={styles.foot} />
            </div>
          </div>
        );
      case "social-post":
        return (
          <div className={styles.post} style={surface}>
            <div className={styles.account}>
              <span className={styles.avatar} style={{ background: accent.hex, color: color(app.ground).hex }}>
                <Mark className={styles.avatarMark} svg={symbol} label="" align="xMidYMid" />
              </span>
              <p>
                {handle}
                <span>{brand.category.name}</span>
              </p>
            </div>
            <p className={styles.headline}>{headline}</p>
            <p className={styles.small}>{lines(app.copy)[0]}</p>
            <DeviceRow active={active} className={styles.foot} />
          </div>
        );
      default:
        return (
          <div className={styles.post} style={surface}>
            <p className={styles.headline}>{headline ?? brand.name}</p>
            <DeviceRow active={active} className={styles.foot} />
          </div>
        );
    }
  };

  return (
    <section id="imagery" className={`${ui.container} ${ui.section}`} aria-labelledby="imagery-title">
      <Heading section={section} title={brand.page?.titles?.imagery ?? device.name}>
        {device.use}
      </Heading>

      <ul className={styles.grid}>
        {device.applications.map((app) => (
          <li key={app.kind} className={styles.item} data-kind={app.kind}>
            <figure className={styles.scene}>{scene(app)}</figure>
            <p className={styles.caption}>
              <span className={styles.kind}>
                {kindNames[app.kind]} · {physicalKinds.includes(app.kind) ? "Print" : "Screen"}
              </span>
              {app.why}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
