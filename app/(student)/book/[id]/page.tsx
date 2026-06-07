"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import AISidebar from "@/components/reader/AISidebar";
import { getBookUrl, cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Bot } from "lucide-react";

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
  const [chatOpen, setChatOpen] = useState(false);
  const currentPageRef = useRef(1);
  const totalPagesRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      const [bookRes, chatRes] = await Promise.all([
        fetch(`/api/books/${bookId}`),
        fetch(`/api/ai/chat?bookId=${bookId}`),
      ]);
      const bookData = await bookRes.json();
      setBook(bookData);
      try {
        const chatData = await chatRes.json();
        if (Array.isArray(chatData)) {
          setMessages(
            chatData
              .filter((m: { role?: string; content?: string }) => m.role && m.content)
              .map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
          );
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

  // Cache extracted DOCX text so we don't re-fetch on every AI message
  const docxTextCache = useRef<string | null>(null);

  const getPageText = useCallback(async (): Promise<string> => {
    if (!book) return "";
    const fileType = book.file_type || "pdf";
    const url = getBookUrl(book.file_path);

    try {
      // --- PDF: extract text from the current page ---
      if (fileType === "pdf") {
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const pdf = await pdfjs.getDocument(url).promise;
        const page = await pdf.getPage(currentPageRef.current);
        const textContent = await page.getTextContent();
        return textContent.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
      }

      // --- DOCX: extract raw text via mammoth, chunk by virtual page ---
      if (fileType === "docx") {
        if (!docxTextCache.current) {
          const mammoth = (await import("mammoth")).default;
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          docxTextCache.current = result.value;
        }
        const fullText = docxTextCache.current;
        const charsPerPage = 3000;
        const start = (currentPageRef.current - 1) * charsPerPage;
        return fullText.slice(start, start + charsPerPage);
      }

      // --- EPUB: extract visible text from the rendered iframe ---
      if (fileType === "epub") {
        const iframe = document.querySelector(".epub-container iframe") as HTMLIFrameElement | null;
        if (iframe?.contentDocument?.body) {
          return iframe.contentDocument.body.innerText.slice(0, 3000);
        }
      }

      return "";
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
    <div className="flex h-full relative overflow-hidden">
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

      {/* Desktop: static sidebar */}
      <div className="hidden lg:flex lg:flex-col w-[30%] h-full overflow-hidden">
        <AISidebar
          bookId={bookId}
          bookTitle={book.title}
          getPageText={getPageText}
          initialMessages={messages}
        />
      </div>

      {/* Mobile: floating chat bubble + overlay panel */}
      <div className="lg:hidden">
        {/* Backdrop */}
        {chatOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setChatOpen(false)}
          />
        )}

        {/* Chat panel */}
        <div
          className={cn(
            "fixed bottom-0 right-0 z-50 w-full sm:w-96 bg-card border-t sm:border-l sm:rounded-tl-2xl shadow-2xl transition-transform duration-200 ease-in-out overflow-hidden flex flex-col",
            chatOpen
              ? "translate-y-0"
              : "translate-y-full"
          )}
          style={{ height: "70vh" }}
        >
          <AISidebar
            bookId={bookId}
            bookTitle={book.title}
            getPageText={getPageText}
            initialMessages={messages}
            onClose={() => setChatOpen(false)}
          />
        </div>

        {/* Floating bubble */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Bot className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
