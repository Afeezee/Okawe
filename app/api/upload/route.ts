import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId, getRole } from "@/lib/clerk";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  // Any signed-in user may upload (their books are private until approved).
  await getCurrentUserId();
  const isAdmin = (await getRole()) === "admin";

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (type !== "cover") {
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 50 MB limit." }, { status: 400 });
    }
    // Admins may upload PDF/DOCX/EPUB; contributors are restricted to PDF.
    if (!isAdmin && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    }
  }

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
