import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRole } from "@/lib/clerk";

async function requireAdminApi() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if ((await getRole()) !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { userId };
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if ("error" in guard) return guard.error;

  const { id } = await ctx.params;
  const { action, rejectionReason, edits, contributorCredit } = await req.json();

  const { data: book } = await db.from("books").select("visibility").eq("id", id).single();
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (book.visibility !== "PENDING") {
    return NextResponse.json({ error: `Book is ${book.visibility}, not PENDING.` }, { status: 409 });
  }

  if (action === "approve") {
    const { data, error } = await db
      .from("books")
      .update({
        ...(edits ?? {}), // optional metadata edits before publishing (snake_case keys)
        contributor_credit: contributorCredit ?? null,
        visibility: "PUBLIC",
        is_published: true,
        reviewed_by: guard.userId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (action === "reject") {
    if (!rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason required." }, { status: 400 });
    }
    const { data, error } = await db
      .from("books")
      .update({
        visibility: "REJECTED",
        rejection_reason: rejectionReason,
        reviewed_by: guard.userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
