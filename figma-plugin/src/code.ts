/**
 * The plugin's Figma side. It reads a bundle from the window, checks the fonts
 * are installed, then carries out the plan from `lib/figma/book.ts`.
 * Running it again updates the variables and styles in place and redraws the
 * page, so a file can be rebuilt after the brand changes.
 */
import { bundleFormat, type FigmaBundle } from "../../lib/figma/bundle";
import {
  bookPlan,
  collectionName,
  column,
  layout,
  missingFonts,
  nearFonts,
  pageName,
  type BookPlan,
  type ContentFrame,
  type Paint,
  type Showcase,
} from "../../lib/figma/book";

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

  const plan = bookPlan(bundle);
  await Promise.all(plan.fonts.map((f) => figma.loadFontAsync(f)));
  const variables = await upsertVariables(plan);
  const styles = await upsertTextStyles(plan);
  await drawPage(plan, variables, styles);
  say("done", `Built ${bundle.name}: ${variables.size} color variables, ${styles.size} text styles, and the ${pageName} page.`);
}

async function upsertVariables(plan: BookPlan) {
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

async function upsertTextStyles(plan: BookPlan) {
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

async function drawPage(plan: BookPlan, variables: Map<string, Variable>, styles: Map<string, TextStyle>) {
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

  /** An SVG mark in one brand color, scaled to fit `width` and `height`. */
  const vector = (name: string, svg: string, color: string, { width = Infinity, height = Infinity }: { width?: number; height?: number }) => {
    const node = figma.createNodeFromSvg(svg);
    node.name = name;
    node.fills = [];
    node.clipsContent = true;
    for (const shape of node.findAll((n) => n.type !== "FRAME" && n.type !== "GROUP")) {
      if ("fills" in shape) shape.fills = [paint({ color })];
    }
    node.rescale(Math.min(width / node.width, height / node.height));
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

  /** Makes a child fill the rest of its vertical parent's height. */
  const grow = (frame: FrameNode) => {
    frame.layoutGrow = 1;
    if (frame.layoutMode === "HORIZONTAL") frame.counterAxisSizingMode = "FIXED";
    else frame.primaryAxisSizingMode = "FIXED";
    return frame;
  };

  /** Makes a card in a horizontal row as tall as the row. */
  const fullHeight = (frame: FrameNode) => {
    frame.layoutAlign = "STRETCH";
    frame.primaryAxisSizingMode = "FIXED";
    return frame;
  };

  /** A landscape frame at its place on the canvas: one row per section, frames left to right. */
  const landscape = (name: string, row: number, place: number, fill = ground) => {
    const frame = box(name, "VERTICAL", { pad: layout.pad, width: layout.width, height: layout.height, fill: { color: fill } });
    frame.clipsContent = true;
    frame.x = place * (layout.width + layout.spacing);
    frame.y = row * (layout.height + layout.spacing);
    page.appendChild(frame);
    return frame;
  };

  /** The section's number, then its name as large as the frame allows. Nothing else. */
  const divider = async (name: string, number: string, title: string, row: number) => {
    const frame = landscape(name, row, 0);
    frame.primaryAxisAlignItems = "SPACE_BETWEEN";
    add(frame, await text(number, role.heading, { color: accent }));
    const big = add(frame, glyphs(plan.display.upper ? title.toUpperCase() : title, plan.display.font, 400, { color: ink }));
    // A long name, such as two words, shrinks to the frame's width.
    if (big.width > column) big.fontSize = Math.floor((400 * column) / big.width);
    return frame;
  };

  /** A small eyebrow, content filling the middle, and a footer with the brand and the page number. */
  const content = async ({ name, eyebrow, page: number, ground: fill, ink, tint }: ContentFrame, row: number, place: number) => {
    const frame = landscape(name, row, place, fill);
    frame.itemSpacing = 48;
    add(frame, await text(eyebrow, role.label, { color: tint }, { stretch: true }));
    const middle = grow(add(frame, box("Content", "VERTICAL", { gap: 24, stretch: true })));
    const foot = add(frame, box("Footer", "HORIZONTAL", { stretch: true }));
    foot.primaryAxisAlignItems = "SPACE_BETWEEN";
    add(foot, await text(plan.brand, role.label, quiet(ink)));
    add(foot, await text(number, role.label, quiet(ink)));
    return middle;
  };

  const palette = async (area: FrameNode) => {
    // Cards as wide as each color's share, every notation as a pill.
    const row = grow(add(area, box("Swatches", "HORIZONTAL", { gap: layout.gap, stretch: true })));
    for (const card of plan.palette.cards) {
      const frame = fullHeight(
        add(
          row,
          box(card.name, "VERTICAL", {
            pad: 36,
            width: card.width,
            radius: layout.radius,
            fill: { color: card.color },
            ...(card.edge ? { stroke: hairline(card.ink) } : {}),
          }),
        ),
      );
      frame.primaryAxisAlignItems = "SPACE_BETWEEN";
      const about = add(frame, box("About", "VERTICAL", { gap: 14, stretch: true }));
      add(about, await text(card.role, role.label, quiet(card.ink), { stretch: true }));
      add(about, await text(card.name, role.heading, { color: card.ink }, { stretch: true }));
      const pills = add(frame, box("Values", "HORIZONTAL", { gap: 6, stretch: true }));
      pills.layoutWrap = "WRAP";
      pills.counterAxisSpacing = 6;
      for (const pill of card.pills) {
        const chip = add(pills, box(pill.label, "HORIZONTAL", { gap: 8, radius: 999, stroke: hairline(card.ink) }));
        chip.paddingLeft = chip.paddingRight = 12;
        chip.paddingTop = chip.paddingBottom = 6;
        chip.counterAxisAlignItems = "CENTER";
        add(chip, await text(pill.label, role.label, quiet(card.ink)));
        add(chip, await text(pill.value, role.small, { color: card.ink }));
      }
    }
    if (plan.palette.note) add(area, await text(plan.palette.note, role.small, quiet(ink), { stretch: true }));
  };

  const faces = async (area: FrameNode) => {
    // A card per face, led by the accent.
    const row = grow(add(area, box("Faces", "HORIZONTAL", { gap: layout.gap, stretch: true })));
    const width = Math.floor((column - layout.gap * (plan.faces.length - 1)) / plan.faces.length);
    for (const face of plan.faces) {
      const card = fullHeight(
        add(
          row,
          box(face.kind, "VERTICAL", {
            pad: 44,
            width,
            radius: layout.radius,
            ...(face.fill ? { fill: { color: face.fill } } : { stroke: hairline(face.ink) }),
          }),
        ),
      );
      card.primaryAxisAlignItems = "SPACE_BETWEEN";
      add(card, await text(face.kind, role.label, quiet(face.ink), { stretch: true }));
      add(card, glyphs(face.glyphs, face.font, 300, { color: face.ink }));
      const about = add(card, box("About", "VERTICAL", { gap: 10, stretch: true }));
      add(about, glyphs(face.family, face.font, 44, { color: face.ink }));
      add(about, await text(face.weights, role.label, quiet(face.ink), { stretch: true }));
    }
  };

  const scale = async (area: FrameNode) => {
    // The scale as rows in one outlined card: settings left, the sample filling the rest.
    const card = grow(add(area, box("Scale", "VERTICAL", { stretch: true, radius: layout.radius, stroke: hairline(ink) })));
    card.paddingLeft = card.paddingRight = 44;
    card.paddingTop = card.paddingBottom = 12;
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    for (const [i, step] of plan.scale.entries()) {
      if (i > 0) {
        const rule = figma.createRectangle();
        rule.name = "Rule";
        rule.resize(column - 88, 1);
        rule.fills = [paint(hairline(ink))];
        add(card, rule).layoutAlign = "STRETCH";
      }
      const line = add(card, box(step.style, "HORIZONTAL", { gap: 48, stretch: true }));
      line.paddingTop = line.paddingBottom = 20;
      line.counterAxisAlignItems = "CENTER";
      const meta = add(line, box("Settings", "VERTICAL", { gap: 6, width: 340 }));
      add(meta, await text(step.id, role.label, { color: accent }, { stretch: true }));
      add(meta, await text(step.spec, role.small, quiet(ink), { stretch: true }));
      const sample = add(line, await text(step.sample, step.style, { color: ink }));
      sample.layoutGrow = 1;
      sample.textAutoResize = "HEIGHT";
    }
  };

  /** What a mark is, in the reading text at the bottom right. */
  const caption = async (area: FrameNode, { name, caption: words }: Pick<Showcase, "name" | "caption">, color: string) => {
    const row = add(area, box("Caption", "HORIZONTAL", { stretch: true }));
    row.primaryAxisAlignItems = "MAX";
    const about = add(row, box(name, "VERTICAL", { gap: 12, width: 560 }));
    add(about, await text(name, role.label, quiet(color), { stretch: true }));
    add(about, await text(words, role.body, quiet(color), { stretch: true }));
  };

  /** A space in the middle of the frame with one mark centered in it. */
  const stage = (area: FrameNode, mark: FrameNode) => {
    const space = grow(add(area, box("Stage", "VERTICAL", { stretch: true })));
    space.primaryAxisAlignItems = space.counterAxisAlignItems = "CENTER";
    add(space, mark);
  };

  /** A sentence set large in the text face, as the Introduction's frames lead with. */
  const statement = (words: string, color: string) => {
    const node = glyphs(words, plan.statement, 64, { color });
    node.lineHeight = { unit: "PERCENT", value: 118 };
    node.resize(1400, node.height);
    node.textAutoResize = "HEIGHT";
    return node;
  };

  /** A label over a large sentence, with the rest of the frame left below it. */
  const lead = async (area: FrameNode, label: string, words: string, color: string) => {
    add(area, await text(label, role.label, quiet(color), { stretch: true }));
    add(area, statement(words, color));
    grow(add(area, box("Space", "VERTICAL", { stretch: true })));
  };

  /** A rounded outline around one short word. */
  const pill = async (parent: FrameNode, words: string, color: string) => {
    const chip = add(parent, box(words, "HORIZONTAL", { radius: 999, stroke: hairline(color) }));
    chip.paddingLeft = chip.paddingRight = 16;
    chip.paddingTop = chip.paddingBottom = 8;
    add(chip, await text(words, role.label, { color }));
  };

  const overview = async (area: FrameNode, { ink }: ContentFrame) => {
    const { positioning, mission, personality } = plan.intro;
    await lead(area, "Positioning", positioning, ink);
    const foot = add(area, box("About", "HORIZONTAL", { gap: 96, stretch: true }));
    if (mission) {
      const block = add(foot, box("Mission", "VERTICAL", { gap: 12, width: 560 }));
      add(block, await text("Mission", role.label, quiet(ink), { stretch: true }));
      add(block, await text(mission, role.body, { color: ink }, { stretch: true }));
    }
    if (personality.length) {
      const block = add(foot, box("Personality", "VERTICAL", { gap: 12 }));
      add(block, await text("Personality", role.label, quiet(ink)));
      const pills = add(block, box("Traits", "HORIZONTAL", { gap: 8 }));
      for (const trait of personality) await pill(pills, trait, ink);
    }
  };

  const refuses = async (area: FrameNode, { ink }: ContentFrame) => {
    // Each sentence on its own line, large: what the category does that the brand won't.
    add(area, await text("What we refuse", role.label, quiet(ink), { stretch: true }));
    const list = grow(add(area, box("Refuses", "VERTICAL", { gap: 40, stretch: true })));
    list.primaryAxisAlignItems = "CENTER";
    for (const line of plan.intro.refuses) add(list, statement(line, ink));
  };

  const idea = async (area: FrameNode, { ink }: ContentFrame) => {
    const { idea: words, values } = plan.intro;
    await lead(area, "The idea", words, ink);
    if (!values.length) return;
    // How the studio works, as outlined cards in a row: the idea's evidence.
    const row = add(area, box("Values", "HORIZONTAL", { gap: layout.gap, stretch: true }));
    const width = Math.floor((column - layout.gap * (values.length - 1)) / values.length);
    for (const { value, means } of values) {
      const card = add(row, box(value, "VERTICAL", { gap: 12, pad: 32, width, radius: layout.radius, stroke: hairline(ink) }));
      add(card, await text(value, role.label, { color: accent }, { stretch: true }));
      add(card, await text(means, role.body, { color: ink }, { stretch: true }));
    }
  };

  const symbol = async (area: FrameNode, { ink }: ContentFrame) => {
    const mark = plan.logo.symbol;
    stage(area, vector(mark.name, mark.svg, mark.ink, { height: 480 }));
    await caption(area, mark, ink);
  };

  const lockup = async (area: FrameNode, { ink }: ContentFrame) => {
    stage(area, vector("Lockup", plan.logo.lockup, ink, { width: 1200, height: 520 }));
  };

  const device = async (area: FrameNode, { ink }: ContentFrame) => {
    // The device runs off both edges, so it sits across the whole frame, outside the margins.
    const graphic = plan.device!;
    const frame = area.parent as FrameNode;
    const row = vector(graphic.name, graphic.svg, graphic.ink, { width: layout.width });
    frame.appendChild(row);
    row.layoutPositioning = "ABSOLUTE";
    row.x = 0;
    row.y = Math.round((layout.height - row.height) / 2);
    area.primaryAxisAlignItems = "MAX";
    await caption(area, graphic, ink);
  };

  const draw = { overview, refuses, idea, palette, faces, scale, symbol, lockup, device };

  /** The edition over the cover's mark, in place of the first section's divider. */
  const cover = async (name: string, row: number) => {
    const frame = landscape(name, row, 0);
    add(frame, await text(plan.cover.edition, role.label, { color: accent }, { stretch: true }));
    stage(frame, vector(name, plan.cover.svg, ink, { width: 1400, height: 600 }));
    return frame;
  };

  const drawn: FrameNode[] = [];
  for (const [row, section] of plan.sections.entries()) {
    const { name, number, title } = section.divider;
    drawn.push(section.divider.cover ? await cover(name, row) : await divider(name, number, title, row));
    for (const [i, spec] of section.frames.entries()) {
      const area = await content(spec, row, i + 1);
      await draw[spec.kind](area, spec);
      drawn.push(area.parent as FrameNode);
    }
  }

  figma.viewport.scrollAndZoomIntoView(drawn);
}
