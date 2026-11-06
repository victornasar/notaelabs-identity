/**
 * The plugin's Figma side. It reads a bundle from the window, checks the fonts
 * are installed, then carries out the plan from `lib/figma/foundations.ts`.
 * Running it again updates the variables and styles in place and redraws the
 * page, so a file can be rebuilt after the brand changes.
 */
import { bundleFormat, type FigmaBundle } from "../../lib/figma/bundle";
import { board, collectionName, foundationsPlan, missingFonts, nearFonts, pageName, type FoundationsPlan } from "../../lib/figma/foundations";

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
  const fill = (color: string): SolidPaint =>
    figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", variables.get(color)!);

  const text = async (characters: string, style: string, color: string) => {
    const node = figma.createText();
    await node.setTextStyleIdAsync(styles.get(style)!.id);
    node.characters = characters;
    node.fills = [fill(color)];
    node.layoutAlign = "STRETCH";
    node.textAutoResize = "HEIGHT";
    return node;
  };

  const stack = (name: string, direction: "VERTICAL" | "HORIZONTAL", spacing: number) => {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = direction;
    frame.itemSpacing = spacing;
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "AUTO";
    frame.fills = [];
    return frame;
  };

  const page = figma.root.children.find((p) => p.name === pageName) ?? figma.createPage();
  page.name = pageName;
  await page.loadAsync();
  for (const child of [...page.children]) child.remove();
  await figma.setCurrentPageAsync(page);

  const root = stack(pageName, "VERTICAL", 96);
  root.counterAxisSizingMode = "FIXED";
  root.resize(board.width, root.height);
  root.paddingLeft = root.paddingRight = root.paddingTop = root.paddingBottom = board.padding;
  root.fills = [fill(plan.ground)];
  page.appendChild(root);

  const section = async (title: string) => {
    const frame = stack(title, "VERTICAL", 40);
    frame.layoutAlign = "STRETCH";
    root.appendChild(frame);
    frame.appendChild(await text(title, plan.heading, plan.ink));
    return frame;
  };

  const colors = await section("Colors");
  const row = stack("Swatches", "HORIZONTAL", 0);
  colors.appendChild(row);
  for (const swatch of plan.swatches) {
    const card = stack(swatch.color, "VERTICAL", 4);
    card.primaryAxisSizingMode = "FIXED";
    card.counterAxisSizingMode = "FIXED";
    card.resize(swatch.width, 560);
    card.primaryAxisAlignItems = "MAX";
    card.paddingLeft = card.paddingRight = card.paddingTop = card.paddingBottom = 32;
    card.fills = [fill(swatch.color)];
    row.appendChild(card);
    for (const line of swatch.lines) card.appendChild(await text(line, plan.label, swatch.ink));
  }

  const type = await section("Type scale");
  for (const specimen of plan.specimens) {
    const item = stack(specimen.style, "VERTICAL", 16);
    item.layoutAlign = "STRETCH";
    type.appendChild(item);
    item.appendChild(await text(specimen.caption, plan.label, specimen.ink));
    item.appendChild(await text(specimen.sample, specimen.style, specimen.ink));
  }

  figma.viewport.scrollAndZoomIntoView([root]);
}
