"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./guide.module.css";

/** One value as a pill. Click to copy; the pill confirms in place. */
export function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button type="button" className={styles.chip} onClick={copy} title={`Copy ${label}`}>
      <span className={styles.chipLabel}>{label}</span>
      <span className={styles.chipValue}>
        <span className={styles.swap} data-hidden={copied || undefined}>
          {value}
        </span>
        <span className={styles.swap} data-hidden={!copied || undefined} aria-hidden={!copied}>
          Copied
        </span>
      </span>
      <span className="visually-hidden" aria-live="polite">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  );
}
