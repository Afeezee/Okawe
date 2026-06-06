"use client";
import { useState } from "react";
import BookCard from "@/components/catalogue/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  subject?: string | null;
  level?: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults(data.books || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI-Powered Search</h1>
        <p className="text-muted-foreground mt-1">Search by topic, concept, or meaning — not just keywords</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
        <Input
          placeholder="e.g., 'data structures for sorting' or 'machine learning basics'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="text-base"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Searching with AI...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : searched ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No relevant books found. Try a different search query.</p>
        </div>
      ) : null}
    </div>
  );
}
