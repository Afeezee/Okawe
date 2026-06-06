import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getBookUrl } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  subject?: string | null;
  level?: string | null;
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-48 bg-muted">
        {book.cover ? (
          <Image src={getBookUrl(book.cover, "cover")} alt={book.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {book.subject && <Badge variant="secondary" className="text-xs">{book.subject}</Badge>}
          {book.level && <Badge variant="outline" className="text-xs">{book.level}</Badge>}
        </div>
        <Link href={`/book/${book.id}`}>
          <Button size="sm" className="w-full">Read Now</Button>
        </Link>
      </div>
    </div>
  );
}
