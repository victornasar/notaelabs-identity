import { Mark } from "@/components/shell/mark";
import type { ActiveBrand } from "@/lib/brand/active";
import styles from "./ui.module.css";

/** The brand's graphic device as a row that runs off both edges of whatever holds it. */
export function DeviceRow({ active, className, tiles = 6 }: { active: ActiveBrand; className?: string; tiles?: number }) {
  const { brand, deviceStrip, color } = active;
  if (!brand.device || !deviceStrip) return null;
  // More tiles than any surface needs; the row clips them at the far edge.
  return (
    <div
      className={`${styles.deviceRow} ${className ?? ""}`}
      data-bleed
      style={{ color: color(brand.device.ink).hex }}
      aria-hidden="true"
    >
      {Array.from({ length: tiles }, (_, i) => (
        <Mark
          key={i}
          className={styles.deviceTile}
          style={{ aspectRatio: deviceStrip.aspect }}
          svg={deviceStrip.svg}
          label=""
          align="xMinYMid"
        />
      ))}
    </div>
  );
}
