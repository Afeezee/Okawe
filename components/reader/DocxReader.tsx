"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import mammoth from "mammoth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, Loader2 } from "lucide-react";

interface DocxReaderProps {
  fileUrl: string;
  bookTitle: string;
  bookId: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onBookmark?: (page: number) => void;
}

const PAGE_HEIGHT = 900;

export default function DocxReader({ fileUrl, bookTitle, bookId, onPageChange, onBookmark }: DocxReaderProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [jumpTo, setJumpTo] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadDocx() {
      try {
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
      } catch {
        setError("Failed to load document.");
      } finally {
        setLoading(false);
      }
    }
    loadDocx();
  }, [fileUrl]);

  // Calculate total pages when content renders
  useEffect(() => {
    if (!contentRef.current || !html) return;
    const observer = new ResizeObserver(() => {
      if (!contentRef.current) return;
      const totalHeight = contentRef.current.scrollHeight;
      const pages = Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT));
      setNumPages(pages);
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [html]);

  // Notify parent of page changes
  useEffect(() => {
    onPageChange?.(pageNumber, numPages);
  }, [pageNumber, numPages, onPageChange]);

  // Scroll to page position when page number changes programmatically
  const scrollToPage = useCallback((page: number) => {
    if (!containerRef.current) return;
    isScrollingProgrammatically.current = true;

    const scrollTop = (page - 1) * PAGE_HEIGHT * scale;
    containerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });

    // Clear the programmatic flag after the smooth scroll finishes
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 600);
  }, [scale]);

  const goToPage = useCallback((page: number) => {
    const p = Math.max(1, Math.min(page, numPages));
    setPageNumber(p);
    scrollToPage(p);
  }, [numPages, scrollToPage]);

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(jumpTo);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      goToPage(p);
    }
    setJumpTo("");
  }

  // Track page from manual user scrolling only
  function handleScroll() {
    if (isScrollingProgrammatically.current) return;
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop / scale;
    const currentPage = Math.min(numPages, Math.floor(scrollTop / PAGE_HEIGHT) + 1);
    if (currentPage !== pageNumber) {
      setPageNumber(currentPage);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">{error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b bg-muted/30 gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2">
            Page {pageNumber} of {numPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages}>
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(2, +(s + 0.1).toFixed(1)))}>
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

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/20"
        onScroll={handleScroll}
      >
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto bg-background shadow-sm border-x"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            padding: "40px 48px",
          }}
        >
          <div className="mb-6 pb-4 border-b">
            <h1 className="text-2xl font-bold">{bookTitle}</h1>
          </div>
          <article
            className="prose prose-sm dark:prose-invert max-w-none
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4
              [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2
              [&_p]:mb-3 [&_p]:leading-7
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
              [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium
              [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3
              [&_li]:mb-1
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
