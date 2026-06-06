"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import AISidebar from "@/components/reader/AISidebar";
import { getBookUrl } from "@/lib/utils";
import { useParams } from "next/navigation";

const PDFReader = dynamic(() => import("@/components/reader/PDFReader"), { ssr: false });
const DocxReader = dynamic(() => import("@/components/reader/DocxReader"), { ssr: false });
const EpubReader = dynamic(() => import("@/components/reader/EpubReader"), { ssr: false });

interface BookData {
  id: string;
  title: string;
  author: string;
  file_path: string;
  file_type: string;
  page_count: number | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function BookReaderPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [book, setBook] = useState<BookData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const currentPageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      const [bookRes, chatRes] = await Promise.all([
        fetch(`/api/books/${bookId}`),
        fetch(`/api/bookmarks?bookId=${bookId}`),
      ]);
      const bookData = await bookRes.json();
      setBook(bookData);
      try {
        const chatData = await chatRes.json();
        if (Array.isArray(chatData)) {
          setMessages(chatData.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      } catch {
        // no prior messages
      }
      setLoading(false);
    }
    load();
  }, [bookId]);

  const handlePageChange = useCallback(
    (page: number, totalPages: number) => {
      currentPageRef.current = page;
      totalPagesRef.current = totalPages;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId, lastPage: page, pageCount: totalPages }),
        }).catch(() => {});
      }, 1000);
    },
    [bookId]
  );

  const handleBookmark = useCallback(
    async (page: number) => {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, page }),
      });
    },
    [bookId]
  );

  const getPageText = useCallback(async (): Promise<string> => {
    if (!book || book.file_type !== "pdf") return "";
    try {
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const url = getBookUrl(book.file_path);
      const pdf = await pdfjs.getDocument(url).promise;
      const page = await pdf.getPage(currentPageRef.current);
      const textContent = await page.getTextContent();
      return textContent.items.map((item) => ("str" in item ? (item as { str: string }).str : "")).join(" ");
    } catch {
      return "";
    }
  }, [book]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Loading book...</div>;
  }

  if (!book) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Book not found</div>;
  }

  const fileUrl = getBookUrl(book.file_path);
  const fileType = book.file_type || "pdf";

  return (
    <div className="flex h-full">
      <div className="flex-1 lg:w-[70%]">
        {fileType === "pdf" && (
          <PDFReader
            fileUrl={fileUrl}
            bookId={bookId}
            onPageChange={handlePageChange}
            onBookmark={handleBookmark}
          />
        )}
        {fileType === "docx" && (
          <DocxReader
            fileUrl={fileUrl}
            bookTitle={book.title}
            bookId={bookId}
            onPageChange={handlePageChange}
            onBookmark={handleBookmark}
          />
        )}
        {fileType === "epub" && (
          <EpubReader
            fileUrl={fileUrl}
            bookTitle={book.title}
            bookId={bookId}
            onPageChange={handlePageChange}
            onBookmark={handleBookmark}
          />
        )}
      </div>
      <div className="hidden lg:block w-[30%]">
        <AISidebar
          bookId={bookId}
          bookTitle={book.title}
          getPageText={getPageText}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
