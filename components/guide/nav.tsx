"use client";

import { useEffect, useState } from "react";
import styles from "./guide.module.css";

export type Section = { id: string; label: string };

/** A floating pill: the symbol home, the sections, and which one you're in. */
export function Nav({ name, symbol, sections }: { name: string; symbol: React.ReactNode; sections: Section[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      // A section is current while it crosses a line a third of the way down.
      { rootMargin: "-33% 0px -66% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className={styles.nav} aria-label="Contents">
      <a href="#top" className={styles.navHome} title={name}>
        <span className={styles.navSymbol}>{symbol}</span>
        <span className="visually-hidden">{name}</span>
      </a>
      <ol className={styles.navList}>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={styles.navLink} aria-current={current === s.id ? "true" : undefined}>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
