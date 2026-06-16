import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: book } = await db
    .from("books")
    .select("uploaded_by, visibility, rights_confirmed")
    .eq("id", id)
    .single();

  if (!book || book.uploaded_by !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!["PRIVATE", "REJECTED"].includes(book.visibility)) {
    return NextResponse.json({ error: `Cannot submit a ${book.visibility} book.` }, { status: 409 });
  }
  if (!book.rights_confirmed) {
    return NextResponse.json({ error: "Confirm sharing rights first." }, { status: 400 });
  }

  const { data, error } = await db
    .from("books")
    .update({ visibility: "PENDING", rejection_reason: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
