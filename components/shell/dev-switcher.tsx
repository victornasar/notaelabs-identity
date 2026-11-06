import styles from "./dev-switcher.module.css";

/** Dev only: flip between brand fixtures while working on the shell. */
export function DevSwitcher({ current, slugs }: { current: string; slugs: string[] }) {
  return (
    <nav className={`label ${styles.switcher}`} aria-label="Brand fixtures">
      {slugs.map((slug) => (
        <a key={slug} href={`/${slug}`} aria-current={slug === current ? "page" : undefined}>
          {slug}
        </a>
      ))}
    </nav>
  );
}
