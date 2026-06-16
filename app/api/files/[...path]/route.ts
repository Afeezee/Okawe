import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRole } from "@/lib/clerk";

export async function GET(_: NextRequest, ctx: RouteContext<"/api/files/[...path]">) {
  const { path } = await ctx.params;
  const folder = path[0]; // "covers" | "documents"
  const filename = path.slice(1).join("/");

  // Covers are public — redirect straight to public storage.
  if (folder === "covers") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    return NextResponse.redirect(`${supabaseUrl}/storage/v1/object/public/covers/${filename}`);
  }

  // Documents require an access check so private/pending books can't be fetched by guessing the filename.
  const { data: book } = await db
    .from("books")
    .select("uploaded_by, visibility")
    .eq("file_path", filename)
    .limit(1)
    .maybeSingle();

  if (!book) return new NextResponse("Not found", { status: 404 });

  const { userId } = await auth();
  const isAdmin = (await getRole()) === "admin";
  const canAccess =
    book.visibility === "PUBLIC" ||
    isAdmin ||
    (!!userId && book.uploaded_by === userId);

  if (!canAccess) return new NextResponse("Forbidden", { status: 403 });

  // Stream the file through the service role so the underlying storage object
  // never has to be public for private books.
  const { data: blob, error } = await db.storage.from("documents").download(filename);
  if (error || !blob) return new NextResponse("Not found", { status: 404 });

  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "pdf" ? "application/pdf" :
    ext === "epub" ? "application/epub+zip" :
    ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
    "application/octet-stream";

  return new NextResponse(blob.stream(), {
    headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=0" },
  });
}
