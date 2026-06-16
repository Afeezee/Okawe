import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRole } from "@/lib/clerk";

export type BookAccess = { allowed: boolean; isOwner: boolean; isAdmin: boolean };

/** Can the current user READ this book (open reader / use AI on it)? */
export async function canReadBook(bookId: string): Promise<BookAccess> {
  const { userId } = await auth();
  const isAdmin = (await getRole()) === "admin";

  const { data: book } = await db
    .from("books")
    .select("uploaded_by, visibility")
    .eq("id", bookId)
    .single();

  if (!book) return { allowed: false, isOwner: false, isAdmin };

  const isOwner = !!userId && book.uploaded_by === userId;
  return { allowed: book.visibility === "PUBLIC" || isOwner || isAdmin, isOwner, isAdmin };
}

/** Assert the current user OWNS this book. Throws "UNAUTHORIZED" / "FORBIDDEN". */
export async function assertOwner(bookId: string): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  const { data: book } = await db
    .from("books")
    .select("uploaded_by")
    .eq("id", bookId)
    .single();

  if (!book || book.uploaded_by !== userId) throw new Error("FORBIDDEN");
  return { userId };
}
