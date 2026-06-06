import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/clerk";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bucket = type === "cover" ? "covers" : "documents";
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await db.storage.from(bucket).upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const fileType = ext === "epub" ? "epub" : ext === "docx" ? "docx" : "pdf";

  return NextResponse.json({ filename, fileType });
}
