/**
 * The plugin's Figma side. It reads a bundle from the window, checks the fonts
 * are installed, then carries out the plan from `lib/figma/foundations.ts`.
 * Running it again updates the variables and styles in place and redraws the
 * page, so a file can be rebuilt after the brand changes.
 */
import { bundleFormat, type FigmaBundle } from "../../lib/figma/bundle";
import {
  collectionName,
  foundationsPlan,
  layout,
  missingFonts,
  nearFonts,
  pageName,
  type FoundationsPlan,
  type Paint,
  type SectionHead,
} from "../../lib/figma/foundations";

figma.showUI(__html__, { width: 360, height: 320, themeColors: true });

const say = (type: "status" | "error" | "done", text: string) => figma.ui.postMessage({ type, text });

figma.ui.onmessage = async (msg: { type: string; text: string }) => {
  if (msg.type !== "build") return;
  try {
    const bundle = JSON.parse(msg.text) as FigmaBundle;
    if (bundle.format !== bundleFormat) {
      say("error", `This file is format ${bundle.format}; the plugin reads ${bundleFormat}. Run pnpm export-figma again.`);
      return;
    }
    await build(bundle);
  } catch (error) {
    say("error", error instanceof Error ? error.message : String(error));
  }
};

async function build(bundle: FigmaBundle) {
  const available = (await figma.listAvailableFontsAsync()).map((f) => f.fontName);
  const missing = missingFonts(bundle, available);
  if (missing.length) {
    const list = missing
      .map((f) => {
        const near = nearFonts(f, available);
        return `• ${f.family} ${f.style}\n  ${f.file}${near.length ? `\n  Figma has ${near.join("; ")}` : ""}`;
      })
      .join("\n");
    say(
      "error",
      `Figma can't see these fonts:\n${list}\n\nRun pnpm export-figma ${bundle.slug} --install-fonts, restart Figma, then run the plugin again.`,
    );
    return;
  }

  const plan = foundationsPlan(bundle);
  await Promise.all(plan.fonts.map((f) => figma.loadFontAsync(f)));
  const variables = await upsertVariables(plan);
  const styles = await upsertTextStyles(plan);
  await drawPage(plan, variables, styles);
  say("done", `Built ${bundle.name}: ${variables.size} color variables, ${styles.size} text styles, and the ${pageName} page.`);
}

async function upsertVariables(plan: FoundationsPlan) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection = collections.find((c) => c.name === collectionName) ?? figma.variables.createVariableCollection(collectionName);
  const modeId = collection.modes[0]!.modeId;
  const existing = (await figma.variables.getLocalVariablesAsync("COLOR")).filter((v) => v.variableCollectionId === collection.id);

  const out = new Map<string, Variable>();
  for (const { name, rgb, description } of plan.variables) {
    const variable = existing.find((v) => v.name === name) ?? figma.variables.createVariable(name, collection, "COLOR");
    variable.setValueForMode(modeId, { ...rgb, a: 1 });
    variable.description = description;
    out.set(name, variable);
  }
  return out;
}

async function upsertTextStyles(plan: FoundationsPlan) {
  const existing = await figma.getLocalTextStylesAsync();
  const out = new Map<string, TextStyle>();
  for (const spec of plan.textStyles) {
    const style = existing.find((s) => s.name === spec.name) ?? figma.createTextStyle();
    style.name = spec.name;
    style.fontName = spec.font;
    style.fontSize = spec.fontSize;
    style.lineHeight = spec.lineHeight;
    style.letterSpacing = spec.letterSpacing;
    style.textCase = spec.textCase;
    style.description = spec.description;
    out.set(spec.name, style);
  }
  return out;
}

async function drawPage(plan: FoundationsPlan, variables: Map<string, Variable>, styles: Map<string, TextStyle>) {
  const paint = ({ color, opacity = 1 }: Paint): SolidPaint =>
    figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity }, "color", variables.get(color)!);
  // Quiet text and hairlines are the ink at lower opacity, as on the page.
  const quiet = (color: string): Paint => ({ color, opacity: 0.62 });
  const hairline = (color: string): Paint => ({ color, opacity: 0.16 });

  /** An auto-layout frame. Width is fixed when given; otherwise it hugs, or fills its parent with `stretch`. */
  const box = (
    name: string,
    direction: "VERTICAL" | "HORIZONTAL",
    { gap = 0, pad = 0, width, height, stretch = false, fill, stroke, radius = 0 }: {
      gap?: number;
      pad?: number;
      width?: number;
      height?: number;
      stretch?: boolean;
      fill?: Paint;
      stroke?: Paint;
      radius?: number;
    } = {},
  ) => {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = direction;
    frame.itemSpacing = gap;
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = pad;
    frame.fills = fill ? [paint(fill)] : [];
    frame.cornerRadius = radius;
    if (stroke) {
      frame.strokes = [paint(stroke)];
      frame.strokeWeight = 1;
      frame.strokeAlign = "INSIDE";
    }
    // Every parent stacks vertically, so stretching fixes the width, which the parent then sets.
    const wide = width ?? (stretch ? 1 : undefined);
    const fixedMain = direction === "HORIZONTAL" ? wide : height;
    const fixedCross = direction === "HORIZONTAL" ? height : wide;
    frame.primaryAxisSizingMode = fixedMain ? "FIXED" : "AUTO";
    frame.counterAxisSizingMode = fixedCross ? "FIXED" : "AUTO";
    if (width || height) frame.resize(width ?? frame.width, height ?? frame.height);
    if (stretch) frame.layoutAlign = "STRETCH";
    return frame;
  };

  /** A text node in a text style. `width` wraps it; `stretch` fills its parent's width. */
  const text = async (characters: string, style: string, color: Paint, { width, stretch = false }: { width?: number; stretch?: boolean } = {}) => {
    const node = figma.createText();
    await node.setTextStyleIdAsync(styles.get(style)!.id);
    node.characters = characters;
    node.fills = [paint(color)];
    if (width) {
      node.resize(width, node.height);
      node.textAutoResize = "HEIGHT";
    } else if (stretch) {
      node.layoutAlign = "STRETCH";
      node.textAutoResize = "HEIGHT";
    }
    return node;
  };

  /** Text set in a font directly, for specimens bigger than any style. */
  const glyphs = (characters: string, font: FontName, size: number, color: Paint) => {
    const node = figma.createText();
    node.fontName = font;
    node.fontSize = size;
    node.lineHeight = { unit: "PERCENT", value: 100 };
    node.characters = characters;
    node.fills = [paint(color)];
    return node;
  };

  const add = <T extends SceneNode>(parent: FrameNode, child: T) => {
    parent.appendChild(child);
    return child;
  };

  const { text: role, ink, ground, accent } = plan;

  const page = figma.root.children.find((p) => p.name === pageName) ?? figma.createPage();
  page.name = pageName;
  await page.loadAsync();
  for (const child of [...page.children]) child.remove();
  await figma.setCurrentPageAsync(page);

  const board = box(pageName, "VERTICAL", { gap: layout.section, width: layout.width, fill: { color: ground } });
  board.paddingLeft = board.paddingRight = (layout.width - layout.column) / 2;
  board.paddingTop = board.paddingBottom = 160;
  page.appendChild(board);

  /** A section's eyebrow and headline on the left, its intro on the right, as on the page. */
  const section = async (name: string, head: SectionHead) => {
    const frame = add(board, box(name, "VERTICAL", { gap: 48, width: layout.column }));
    const top = add(frame, box("Heading", "HORIZONTAL", { width: layout.column }));
    top.primaryAxisAlignItems = "SPACE_BETWEEN";
    top.counterAxisAlignItems = "MAX";
    const left = add(top, box("Title", "VERTICAL", { gap: 20, width: 720 }));
    add(left, await text(head.eyebrow, role.label, { color: accent }, { stretch: true }));
    add(left, await text(head.title, role.heading, { color: ink }, { stretch: true }));
    if (head.intro) add(top, await text(head.intro, role.body, quiet(ink), { width: 400 }));
    return frame;
  };

  const subtitle = async (parent: FrameNode, title: string) => {
    const frame = add(parent, box(title, "VERTICAL", { stretch: true }));
    frame.paddingTop = 48;
    add(frame, await text(title, role.heading, { color: ink }, { stretch: true }));
  };

  // Color: cards as wide as each color's share, every notation as a pill.
  const color = await section("Color", plan.color);
  const row = add(color, box("Swatches", "HORIZONTAL", { gap: layout.gap }));
  for (const card of plan.color.cards) {
    const frame = add(
      row,
      box(card.name, "VERTICAL", {
        pad: 32,
        width: card.width,
        height: layout.swatchHeight,
        radius: layout.radius,
        fill: { color: card.color },
        ...(card.edge ? { stroke: hairline(card.ink) } : {}),
      }),
    );
    frame.primaryAxisAlignItems = "SPACE_BETWEEN";
    const top = add(frame, box("About", "VERTICAL", { gap: 14, stretch: true }));
    add(top, await text(card.role, role.label, quiet(card.ink), { stretch: true }));
    add(top, await text(card.name, role.heading, { color: card.ink }, { stretch: true }));
    add(top, await text(card.use, role.body, { color: card.ink }, { stretch: true }));
    const pills = add(frame, box("Values", "HORIZONTAL", { gap: 6, stretch: true }));
    pills.layoutWrap = "WRAP";
    pills.counterAxisSpacing = 6;
    pills.primaryAxisSizingMode = "FIXED";
    for (const pill of card.pills) {
      const chip = add(pills, box(pill.label, "HORIZONTAL", { gap: 8, radius: 999, stroke: hairline(card.ink) }));
      chip.paddingLeft = chip.paddingRight = 12;
      chip.paddingTop = chip.paddingBottom = 6;
      chip.counterAxisAlignItems = "CENTER";
      add(chip, await text(pill.label, role.label, quiet(card.ink)));
      add(chip, await text(pill.value, role.small, { color: card.ink }));
    }
  }
  if (plan.color.note) add(color, await text(plan.color.note, role.small, quiet(ink), { width: 640 }));

  // Type: a card per face, then the scale as rows in one outlined card.
  const type = await section("Type", plan.type);
  const faces = add(type, box("Faces", "HORIZONTAL", { gap: layout.gap, width: layout.column }));
  const faceWidth = Math.floor((layout.column - layout.gap * (plan.type.faces.length - 1)) / plan.type.faces.length);
  for (const face of plan.type.faces) {
    const card = add(
      faces,
      box(face.kind, "VERTICAL", {
        pad: 40,
        width: faceWidth,
        height: 580,
        radius: layout.radius,
        ...(face.fill ? { fill: { color: face.fill } } : { stroke: hairline(face.ink) }),
      }),
    );
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    add(card, await text(face.kind, role.label, quiet(face.ink), { stretch: true }));
    add(card, glyphs(face.glyphs, face.font, 240, { color: face.ink }));
    const about = add(card, box("About", "VERTICAL", { gap: 10, stretch: true }));
    add(about, glyphs(face.family, face.font, 40, { color: face.ink }));
    add(about, await text(face.role, role.body, { color: face.ink }, { stretch: true }));
    add(about, await text(face.weights, role.label, quiet(face.ink), { stretch: true }));
  }

  await subtitle(type, "The scale");
  const scale = add(type, box("Scale", "VERTICAL", { pad: 40, width: layout.column, radius: layout.radius, stroke: hairline(ink) }));
  for (const [i, step] of plan.type.scale.entries()) {
    if (i > 0) {
      const rule = figma.createRectangle();
      rule.name = "Rule";
      rule.resize(layout.column - 80, 1);
      rule.fills = [paint(hairline(ink))];
      rule.layoutAlign = "STRETCH";
      add(scale, rule);
    }
    const line = add(scale, box(step.style, "HORIZONTAL", { gap: 40, stretch: true }));
    line.paddingTop = line.paddingBottom = 28;
    const meta = add(line, box("Settings", "VERTICAL", { gap: 6, width: 280 }));
    add(meta, await text(step.id, role.label, { color: accent }, { stretch: true }));
    add(meta, await text(step.spec, role.small, quiet(ink), { stretch: true }));
    add(meta, await text(step.use, role.small, quiet(ink), { stretch: true }));
    const sample = add(line, await text(step.sample, step.style, { color: ink }));
    sample.layoutGrow = 1;
    sample.textAutoResize = "HEIGHT";
  }

  figma.viewport.scrollAndZoomIntoView([board]);
}
