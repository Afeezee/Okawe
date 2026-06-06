import { NextRequest, NextResponse } from "next/server";
import { askReadingAssistant } from "@/lib/groq";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/clerk";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const bookId = req.nextUrl.searchParams.get("bookId");

  if (!bookId) return NextResponse.json([]);

  const { data } = await db
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("created_at", { ascending: true })
    .limit(50);

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { bookId, bookTitle, pageText, question, history } = await req.json();

  try {
    const answer = await askReadingAssistant(bookTitle, pageText, question, history);

    await db.from("chat_messages").insert([
      { user_id: userId, book_id: bookId, role: "user", content: question },
      { user_id: userId, book_id: bookId, role: "assistant", content: answer },
    ]);

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json({ error: "AI is busy, please try again in a moment." }, { status: 429 });
    }
    throw err;
  }
}
