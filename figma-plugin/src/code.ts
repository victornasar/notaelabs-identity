/**
 * The plugin's Figma side. It reads a bundle from the window, checks the fonts
 * are installed, then carries out the plan from `lib/figma/foundations.ts`.
 * Running it again updates the variables and styles in place and redraws the
 * page, so a file can be rebuilt after the brand changes.
 */
import { bundleFormat, type FigmaBundle } from "../../lib/figma/bundle";
import {
  collectionName,
  column,
  foundationsPlan,
  layout,
  missingFonts,
  nearFonts,
  pageName,
  type FoundationsPlan,
  type Paint,
  type Slide,
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

  /**
   * A landscape frame: the eyebrow and headline on the left, the intro on the
   * right, the content filling the middle, and a footer naming the brand and
   * the frame. Returns the content area.
   */
  const slide = async ({ name, head, footer }: Slide, index: number) => {
    const frame = box(name, "VERTICAL", { gap: 56, pad: layout.pad, width: layout.width, height: layout.height, fill: { color: ground } });
    frame.clipsContent = true;
    frame.x = index * (layout.width + layout.spacing);
    page.appendChild(frame);

    const top = add(frame, box("Heading", "HORIZONTAL", { width: column }));
    top.primaryAxisAlignItems = "SPACE_BETWEEN";
    top.counterAxisAlignItems = "MAX";
    const left = add(top, box("Title", "VERTICAL", { gap: 20, width: 1040 }));
    add(left, await text(head.eyebrow, role.label, { color: accent }, { stretch: true }));
    add(left, await text(head.title, role.heading, { color: ink }, { stretch: true }));
    if (head.intro) add(top, await text(head.intro, role.body, quiet(ink), { width: 520 }));

    const content = grow(add(frame, box("Content", "VERTICAL", { gap: 24, stretch: true })));

    const foot = add(frame, box("Footer", "HORIZONTAL", { stretch: true }));
    foot.primaryAxisAlignItems = "SPACE_BETWEEN";
    for (const words of footer) add(foot, await text(words, role.label, quiet(ink)));
    return content;
  };

  const frames: FrameNode[] = [];
  for (const [index, spec] of plan.slides.entries()) {
    const content = await slide(spec, index);
    frames.push(content.parent as FrameNode);

    if (spec.kind === "color") {
      // Cards as wide as each color's share, every notation as a pill.
      const row = grow(add(content, box("Swatches", "HORIZONTAL", { gap: layout.gap, stretch: true })));
      for (const card of plan.color.cards) {
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
        add(about, await text(card.use, role.body, { color: card.ink }, { stretch: true }));
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
      if (plan.color.note) add(content, await text(plan.color.note, role.small, quiet(ink), { width: 760 }));
    }

    if (spec.kind === "faces") {
      // A card per face, led by the accent.
      const row = grow(add(content, box("Faces", "HORIZONTAL", { gap: layout.gap, stretch: true })));
      const width = Math.floor((column - layout.gap * (plan.type.faces.length - 1)) / plan.type.faces.length);
      for (const face of plan.type.faces) {
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
        add(card, glyphs(face.glyphs, face.font, 260, { color: face.ink }));
        const about = add(card, box("About", "VERTICAL", { gap: 10, stretch: true }));
        add(about, glyphs(face.family, face.font, 44, { color: face.ink }));
        add(about, await text(face.role, role.body, { color: face.ink }, { stretch: true }));
        add(about, await text(face.weights, role.label, quiet(face.ink), { stretch: true }));
      }
    }

    if (spec.kind === "scale") {
      // The scale as rows in one outlined card: settings left, the sample filling the rest.
      const card = grow(add(content, box("Scale", "VERTICAL", { stretch: true, radius: layout.radius, stroke: hairline(ink) })));
      card.paddingLeft = card.paddingRight = 44;
      card.paddingTop = card.paddingBottom = 12;
      card.primaryAxisAlignItems = "SPACE_BETWEEN";
      for (const [i, step] of plan.type.scale.entries()) {
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
        add(meta, await text(step.use, role.small, quiet(ink), { stretch: true }));
        const sample = add(line, await text(step.sample, step.style, { color: ink }));
        sample.layoutGrow = 1;
        sample.textAutoResize = "HEIGHT";
      }
    }
  }

  figma.viewport.scrollAndZoomIntoView(frames);
}
