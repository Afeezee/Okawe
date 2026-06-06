"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";

interface BookmarkItem {
  id: string;
  bookId: string;
  page: number;
  note: string | null;
  createdAt: string;
  book: { title: string; cover: string | null };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then(setBookmarks)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading bookmarks...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Pages you&apos;ve saved for later</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No bookmarks yet. Open a book and bookmark pages to save them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{bm.book.title}</p>
                  <p className="text-sm text-muted-foreground">Page {bm.page}{bm.note ? ` — ${bm.note}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/book/${bm.bookId}`}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(bm.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
