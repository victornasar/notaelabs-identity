import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Board } from "@/components/routes/board";
import { boardSlugs, getBoard } from "@/lib/brand/route-board";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return boardSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${(await params).slug} · Routes` };
}

// Reads marks, scores and gates from disk on every request, so a re-render shows on refresh.
async function LiveBoard({ params }: Props) {
  await connection();
  const board = getBoard((await params).slug);
  if (!board) notFound();
  return <Board board={board} />;
}

export default function RoutesPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="label">Checking routes…</p>}>
      <LiveBoard params={params} />
    </Suspense>
  );
}
