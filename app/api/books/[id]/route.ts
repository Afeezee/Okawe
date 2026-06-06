import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, ctx: RouteContext<"/api/books/[id]">) {
  const { id } = await ctx.params;
  const { data, error } = await db.from("books").select("*").eq("id", id).single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/books/[id]">) {
  const { id } = await ctx.params;
  const body = await req.json();
  const { data, error } = await db.from("books").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, ctx: RouteContext<"/api/books/[id]">) {
  const { id } = await ctx.params;
  const { error } = await db.from("books").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
