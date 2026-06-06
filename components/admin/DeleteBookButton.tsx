"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteBookButton({ bookId }: { bookId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setLoading(true);
    await fetch(`/api/books/${bookId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
    </Button>
  );
}
