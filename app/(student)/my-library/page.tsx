import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { FolderUp, Plus } from "lucide-react";
import MyBookCard, { type MyBook } from "@/components/library/MyBookCard";

export const dynamic = "force-dynamic";

export default async function MyLibraryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data } = await db
    .from("books")
    .select("*")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });

  const books = (data ?? []) as MyBook[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderUp className="w-7 h-7 text-primary" /> My Library
          </h1>
          <p className="text-muted-foreground mt-1">Your uploads — private until you submit them for review.</p>
        </div>
        <Link href="/my-library/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Upload
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <p className="text-muted-foreground mb-4">You haven&apos;t uploaded any books yet.</p>
          <Link href="/my-library/upload">
            <Button variant="outline">Upload your first book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <MyBookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
