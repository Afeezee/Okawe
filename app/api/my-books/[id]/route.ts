import { NextRequest, NextResponse } from "next/server";
import { assertOwner } from "@/lib/access";
import { db } from "@/lib/db";

function errStatus(message: string) {
  return message === "FORBIDDEN" ? 403 : message === "UNAUTHORIZED" ? 401 : 500;
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await assertOwner(id);
    // FK cascades clear reading_sessions / bookmarks / chat_messages.
    const { error } = await db.from("books").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = (e as Error).message;
    return NextResponse.json({ error: message }, { status: errStatus(message) });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await assertOwner(id);

    const { data: book } = await db.from("books").select("visibility").eq("id", id).single();
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!["PRIVATE", "REJECTED"].includes(book.visibility)) {
      return NextResponse.json(
        { error: `Cannot edit a ${book.visibility} book.` },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { title, author, description, subject, level, tags, rightsConfirmed } = body;

    const { data, error } = await db
      .from("books")
      .update({
        title,
        author,
        description,
        subject,
        level,
        tags,
        rights_confirmed: rightsConfirmed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = (e as Error).message;
    return NextResponse.json({ error: message }, { status: errStatus(message) });
  }
}
