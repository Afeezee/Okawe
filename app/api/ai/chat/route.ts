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
    console.error("AI chat error:", err);
    const status = (err as { status?: number })?.status;
    const message = (err as { message?: string })?.message ?? "Unknown error";

    if (status === 429) {
      return NextResponse.json(
        { answer: "⏳ AI is busy right now. Please try again in a moment." },
        { status: 200 }
      );
    }
    if (status === 403) {
      return NextResponse.json(
        { answer: "🔒 AI service access is restricted from this network. The AI chat works on the deployed Vercel site. If running locally, try using a VPN." },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { answer: `❗ AI error: ${message}. Please try again later.` },
      { status: 200 }
    );
  }
}
