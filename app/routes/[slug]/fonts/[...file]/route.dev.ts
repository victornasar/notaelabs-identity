import { fontFile } from "@/lib/brand/route-board";

// Serves a brand's licensed font files to the /routes page, from brands/<slug>/fonts/.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; file: string[] }> }) {
  const { slug, file } = await params;
  const bytes = fontFile(slug, file.map(decodeURIComponent));
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: { "content-type": file.at(-1)!.endsWith(".otf") ? "font/otf" : "font/ttf" },
  });
}
