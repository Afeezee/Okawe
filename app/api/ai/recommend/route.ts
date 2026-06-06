import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/groq";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/clerk";

export async function GET() {
  const userId = await getCurrentUserId();

  const { data: sessions } = await db
    .from("reading_sessions")
    .select("book_id, books(title, subject)")
    .eq("user_id", userId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionList = (sessions || []) as any[];
  const readHistory = sessionList.map((s) => ({
    title: s.books?.title ?? s.books?.[0]?.title ?? "",
    subject: s.books?.subject ?? s.books?.[0]?.subject ?? null,
  }));
  const readBookIds = sessionList.map((s) => s.book_id);

  const { data: allBooks } = await db
    .from("books")
    .select("id, title, subject, description")
    .eq("is_published", true);

  if (!allBooks) return NextResponse.json({ recommended: [] });

  try {
    const recommendedIds = await getRecommendations(readHistory, allBooks, readBookIds);
    const recommended = recommendedIds.map((id) => allBooks.find((b) => b.id === id)).filter(Boolean);
    return NextResponse.json({ recommended });
  } catch {
    return NextResponse.json({ recommended: allBooks.slice(0, 4) });
  }
}
