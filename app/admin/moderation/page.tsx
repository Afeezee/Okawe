import { db } from "@/lib/db";
import ModerationCard, { type PendingBook } from "@/components/admin/ModerationCard";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const { data } = await db
    .from("books")
    .select("*")
    .eq("visibility", "PENDING")
    .order("created_at", { ascending: true });

  const books = (data ?? []) as PendingBook[];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary" /> Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review user-submitted books. Approve to publish them to the public catalogue, or reject with a reason.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border rounded-xl text-muted-foreground">
          Nothing awaiting approval right now.
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <ModerationCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
