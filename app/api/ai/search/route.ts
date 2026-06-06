import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/lib/groq";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const { data: allBooks } = await db
    .from("books")
    .select("id, title, author, subject, description")
    .eq("is_published", true);

  if (!allBooks) return NextResponse.json({ books: [] });

  try {
    const rankedIds = await semanticSearch(query, allBooks);
    const books = rankedIds.map((id) => allBooks.find((b) => b.id === id)).filter(Boolean);
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ books: allBooks });
  }
}
