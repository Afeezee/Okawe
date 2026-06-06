import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/clerk";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { bookId, lastPage, pageCount } = await req.json();
  const progress = pageCount > 0 ? Math.round((lastPage / pageCount) * 100) : 0;

  const { data: existing } = await db
    .from("reading_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .single();

  if (existing) {
    const { data, error } = await db
      .from("reading_sessions")
      .update({ last_page: lastPage, progress, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await db
      .from("reading_sessions")
      .insert({ user_id: userId, book_id: bookId, last_page: lastPage, progress })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
