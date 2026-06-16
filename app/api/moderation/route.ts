import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRole } from "@/lib/clerk";

// Returns the count of books awaiting approval (used for the admin sidebar badge).
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((await getRole()) !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { count } = await db
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("visibility", "PENDING");

  return NextResponse.json({ pending: count ?? 0 });
}
