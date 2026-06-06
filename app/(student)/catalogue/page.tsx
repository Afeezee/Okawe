"use client";
import { useState, useEffect } from "react";
import BookCard from "@/components/catalogue/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const subjects = ["All", "Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology", "Social Sciences", "Law", "Medicine"];
const levels = ["All", "100L", "200L", "300L", "400L", "500L", "Postgraduate"];

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  subject?: string | null;
  level?: string | null;
}

export default function CataloguePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("All");
  const [level, setLevel] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [subject, level]);

  async function fetchBooks() {
    setLoading(true);
    const params = new URLSearchParams();
    if (subject !== "All") params.set("subject", subject);
    if (level !== "All") params.set("level", level);
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchBooks();
    setSearching(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setBooks(data.books || []);
    } catch {
      // fallback
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book Catalogue</h1>
        <p className="text-muted-foreground mt-1">Browse and discover academic books</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <Input
          placeholder="Search by topic, concept, or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" disabled={searching}>
          <Search className="w-4 h-4 mr-2" />
          {searching ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Button
              key={s}
              variant={subject === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSubject(s)}
              className={cn("text-xs")}
            >
              {s}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <Button
              key={l}
              variant={level === l ? "default" : "outline"}
              size="sm"
              onClick={() => setLevel(l)}
              className="text-xs"
            >
              {l}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No books found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
