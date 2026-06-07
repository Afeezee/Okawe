import { NextRequest, NextResponse } from "next/server";
import { generateSummary, generateQuiz, generateFlashcards } from "@/lib/groq";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/clerk";

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const { bookId, bookTitle, pageText, tool, pageRef } = await req.json();

  let content: string | object = "";

  try {
    if (tool === "summary") content = await generateSummary(bookTitle, pageText);
    if (tool === "quiz") content = await generateQuiz(bookTitle, pageText);
    if (tool === "flashcards") content = await generateFlashcards(bookTitle, pageText);

    await db.from("study_sessions").insert({
      user_id: userId,
      book_id: bookId,
      tool,
      page_ref: pageRef,
      content: JSON.stringify(content),
    });

    return NextResponse.json({ content });
  } catch (err: unknown) {
    console.error("AI study error:", err);
    const status = (err as { status?: number })?.status;
    const message = (err as { message?: string })?.message ?? "Unknown error";

    if (status === 429) {
      return NextResponse.json({ error: "AI is busy, please try again in a moment." }, { status: 429 });
    }
    if (status === 403) {
      return NextResponse.json({ error: "AI service access is restricted from this network. Try the deployed Vercel site or use a VPN locally." }, { status: 403 });
    }
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
