import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/clerk";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import DeleteBookButton from "@/components/admin/DeleteBookButton";

export default async function AdminBooksPage() {
  await requireAdmin();

  const { data: books } = await db
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books</h1>
          <p className="text-muted-foreground mt-1">Manage your library catalogue</p>
        </div>
        <Link href="/admin/books/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Upload New Book
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Author</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Subject</th>
              <th className="text-left p-3 font-medium">Level</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(books || []).map((book: { id: string; title: string; author: string; file_type: string; subject: string | null; level: string | null; is_published: boolean }) => (
              <tr key={book.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{book.title}</td>
                <td className="p-3 text-muted-foreground">{book.author}</td>
                <td className="p-3">
                  <Badge variant="outline" className="text-xs uppercase">{book.file_type || "pdf"}</Badge>
                </td>
                <td className="p-3">
                  {book.subject && <Badge variant="secondary" className="text-xs">{book.subject}</Badge>}
                </td>
                <td className="p-3">
                  {book.level && <Badge variant="outline" className="text-xs">{book.level}</Badge>}
                </td>
                <td className="p-3">
                  <Badge variant={book.is_published ? "default" : "secondary"} className="text-xs">
                    {book.is_published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-3 text-right space-x-2">
                  <Link href={`/admin/books/${book.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteBookButton bookId={book.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!books || books.length === 0) && (
          <div className="p-8 text-center text-muted-foreground">
            No books yet. Upload your first book to get started.
          </div>
        )}
      </div>
    </div>
  );
}
