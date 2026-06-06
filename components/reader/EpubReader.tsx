"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ePub, { Book, Rendition } from "epubjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, Loader2 } from "lucide-react";

interface EpubReaderProps {
  fileUrl: string;
  bookTitle: string;
  bookId: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onBookmark?: (page: number) => void;
}

export default function EpubReader({ fileUrl, bookTitle, bookId, onPageChange, onBookmark }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(100);
  const [jumpTo, setJumpTo] = useState("");
  const [chapterLabel, setChapterLabel] = useState("");

  useEffect(() => {
    if (!viewerRef.current) return;

    const book = ePub(fileUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: "none",
      flow: "paginated",
    });

    renditionRef.current = rendition;

    rendition.themes.default({
      body: {
        "font-family": "system-ui, -apple-system, sans-serif !important",
        "line-height": "1.8 !important",
        "font-size": `${scale}% !important`,
      },
      p: { "margin-bottom": "0.8em !important" },
      h1: { "margin-top": "1.5em !important", "font-weight": "bold !important" },
      h2: { "margin-top": "1.2em !important", "font-weight": "600 !important" },
    });

    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      rendition.themes.default({
        body: { color: "#e2e8f0 !important", background: "#0f172a !important" },
        a: { color: "#60a5fa !important" },
        "*": { color: "inherit !important" },
      });
    }

    rendition.display().then(() => {
      setLoading(false);
    }).catch(() => {
      setError("Failed to load EPUB.");
      setLoading(false);
    });

    book.ready.then(() => {
      return book.locations.generate(1024);
    }).then(() => {
      const total = book.locations.length();
      if (total > 0) setNumPages(total);
    });

    rendition.on("relocated", (location: { start: { href: string; location: number; displayed: { page: number; total: number } } }) => {
      const loc = location.start.location;
      if (loc >= 0) {
        const page = loc + 1;
        setPageNumber(page);
      }

      const nav = book.navigation;
      const toc = nav?.toc || [];
      const match = toc.find((item) => location.start.href.includes(item.href));
      if (match) setChapterLabel(match.label);
    });

    return () => {
      book.destroy();
    };
  }, [fileUrl]);

  useEffect(() => {
    onPageChange?.(pageNumber, numPages);
  }, [pageNumber, numPages, onPageChange]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.fontSize(`${scale}%`);
  }, [scale]);

  const prev = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  const next = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  const goToPage = useCallback((page: number) => {
    if (!bookRef.current) return;
    const p = Math.max(1, Math.min(page, numPages));
    const cfi = bookRef.current.locations.cfiFromLocation(p - 1);
    if (cfi) renditionRef.current?.display(cfi);
  }, [numPages]);

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(jumpTo);
    if (!isNaN(p)) goToPage(p);
    setJumpTo("");
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">{error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev} disabled={pageNumber <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2">
            Page {pageNumber} of {numPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next} disabled={pageNumber >= numPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleJump} className="flex items-center gap-1">
          <Input
            className="w-16 h-8 text-xs"
            placeholder="Go to"
            value={jumpTo}
            onChange={(e) => setJumpTo(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="sm" className="h-8 text-xs">Go</Button>
        </form>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(60, s - 10))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12 text-center">{scale}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(200, s + 10))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {onBookmark && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onBookmark(pageNumber)}>
              <Bookmark className="w-4 h-4 mr-1" /> Bookmark
            </Button>
          )}
          <a href={`/study/${bookId}?page=${pageNumber}`}>
            <Button variant="outline" size="sm" className="h-8 text-xs">Study This Page</Button>
          </a>
        </div>
      </div>

      {chapterLabel && (
        <div className="px-3 py-1 border-b bg-muted/20 text-xs text-muted-foreground truncate">
          {chapterLabel}
        </div>
      )}

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={viewerRef} className="h-full" />
      </div>
    </div>
  );
}
