"use client";
import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark } from "lucide-react";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFReaderProps {
  fileUrl: string;
  initialPage?: number;
  onPageChange?: (page: number, totalPages: number) => void;
  onBookmark?: (page: number) => void;
  bookId: string;
}

export default function PDFReader({ fileUrl, initialPage = 1, onPageChange, onBookmark, bookId }: PDFReaderProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [jumpTo, setJumpTo] = useState("");

  const onDocumentLoadSuccess = useCallback(({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    onPageChange?.(initialPage, total);
  }, [initialPage, onPageChange]);

  function goToPage(page: number) {
    const p = Math.max(1, Math.min(page, numPages));
    setPageNumber(p);
    onPageChange?.(p, numPages);
  }

  function handleJump(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(jumpTo);
    if (!isNaN(p)) goToPage(p);
    setJumpTo("");
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
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

      <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/20">
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="text-muted-foreground p-8">Loading PDF...</div>}>
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </div>
  );
}
