import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await db
    .from("books")
    .select("*")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const body = await req.json();
  const submitNow = body.submitForPublic === true;

  if (submitNow && !body.rightsConfirmed) {
    return NextResponse.json(
      { error: "Rights confirmation required to submit publicly." },
      { status: 400 }
    );
  }

  if (!body.filePath) {
    return NextResponse.json({ error: "A document file is required." }, { status: 400 });
  }

  const uploaderName =
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Anonymous";

  const { data, error } = await db
    .from("books")
    .insert({
      title: body.title,
      author: body.author || "Unknown",
      description: body.description ?? null,
      subject: body.subject ?? null,
      level: body.level ?? null,
      tags: body.tags ?? null,
      cover: body.cover ?? null,
      file_path: body.filePath, // returned from /api/upload
      file_type: "pdf",
      page_count: body.pageCount ?? null,
      uploaded_by: userId,
      uploader_name: uploaderName,
      rights_confirmed: !!body.rightsConfirmed,
      visibility: submitNow ? "PENDING" : "PRIVATE",
      is_published: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
