"use client";
import { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition } from "epubjs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface EpubReaderProps {
  fileUrl: string;
  bookTitle: string;
}

export default function EpubReader({ fileUrl, bookTitle }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentLabel, setCurrentLabel] = useState("");

  useEffect(() => {
    if (!viewerRef.current) return;

    const book = ePub(fileUrl);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      spread: "none",
    });

    renditionRef.current = rendition;

    rendition.themes.default({
      body: { "font-family": "system-ui, sans-serif", "line-height": "1.8", padding: "20px 40px" },
      p: { "margin-bottom": "0.8em" },
      h1: { "margin-top": "1.5em" },
      h2: { "margin-top": "1.2em" },
    });

    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      rendition.themes.default({
        body: { color: "#e2e8f0", background: "#0f172a" },
        a: { color: "#60a5fa" },
      });
    }

    rendition.display().then(() => setLoading(false)).catch(() => {
      setError("Failed to load EPUB.");
      setLoading(false);
    });

    rendition.on("relocated", (location: { start: { href: string } }) => {
      const nav = book.navigation;
      const toc = nav?.toc || [];
      const match = toc.find((item) => location.start.href.includes(item.href));
      if (match) setCurrentLabel(match.label);
    });

    return () => {
      book.destroy();
    };
  }, [fileUrl]);

  function prev() {
    renditionRef.current?.prev();
  }

  function next() {
    renditionRef.current?.next();
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">{error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground truncate px-2">
          {currentLabel || bookTitle}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
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
