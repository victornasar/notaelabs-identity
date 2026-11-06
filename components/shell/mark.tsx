/**
 * Renders a brand mark inline so CSS `color` sets its color. `align` pins the
 * drawing inside its box when the box and the mark have different shapes.
 */
export function Mark({
  svg,
  label,
  className,
  align = "xMinYMax",
}: {
  svg: string;
  label: string;
  className?: string;
  align?: "xMinYMax" | "xMidYMid" | "xMinYMid";
}) {
  const html = svg.replace("<svg ", `<svg preserveAspectRatio="${align} meet" `);
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return <span {...a11y} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
