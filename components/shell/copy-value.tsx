"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./color-section.module.css";

/** One color value. Click to copy; the label confirms in place. */
export function CopyValue({ label, value }: { label: string; value: string }) {
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
    <button type="button" className={styles.value} onClick={copy}>
      <span className={`label ${styles.valueLabel}`}>
        <span className={styles.swap} data-hidden={copied || undefined}>
          {label}
        </span>
        <span className={styles.swap} data-hidden={!copied || undefined} aria-hidden={!copied}>
          Copied
        </span>
      </span>
      <span className={styles.valueText}>{value}</span>
      <span className="visually-hidden" aria-live="polite">
        {copied ? `${label} copied` : ""}
      </span>
    </button>
  );
}
