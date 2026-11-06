import book from "./book.module.css";

/** A heading inside a section: a shell label beside a brand-set title. */
export function Subhead({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`grid ${book.subhead}`}>
      <p className={`label ${book.subLabel}`}>{label}</p>
      <h3 className={book.subTitle}>{title}</h3>
      {children ? <p className={book.subIntro}>{children}</p> : null}
    </div>
  );
}
