import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/clerk";

export async function GET() {
  await requireAdmin();

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });

  const mapped = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.emailAddresses[0]?.emailAddress ?? "",
    imageUrl: u.imageUrl,
    role: (u.publicMetadata as Record<string, string>)?.role ?? "student",
    createdAt: u.createdAt,
    lastSignInAt: u.lastSignInAt,
  }));

  return NextResponse.json(mapped);
}

export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const { userId, role } = await req.json();
  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role required" }, { status: 400 });
  }

  if (!["admin", "student"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  return NextResponse.json({ success: true });
}
