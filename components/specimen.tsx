export function Specimen({
  decision,
  children,
}: {
  decision: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="specimen">
      <figcaption>{decision}</figcaption>
      <div className="specimen-stage">{children}</div>
    </figure>
  );
}
