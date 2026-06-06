import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/clerk";

export async function GET() {
  const userId = await getCurrentUserId();

  const { data, error } = await db
    .from("bookmarks")
    .select("*, books(title, cover)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bookmarks = (data || []).map((bm) => ({
    id: bm.id,
    bookId: bm.book_id,
    page: bm.page,
    note: bm.note,
    createdAt: bm.created_at,
    book: bm.books,
  }));

  return NextResponse.json(bookmarks);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { bookId, page, note } = await req.json();

  const { data, error } = await db
    .from("bookmarks")
    .insert({ user_id: userId, book_id: bookId, page, note })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { id } = await req.json();

  const { error } = await db.from("bookmarks").delete().eq("id", id).eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
