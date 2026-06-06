"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen } from "lucide-react";
import SummaryView from "@/components/study/SummaryView";
import QuizView from "@/components/study/QuizView";
import FlashcardView from "@/components/study/FlashcardView";
import { getBookUrl } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Flashcard {
  front: string;
  back: string;
}

export default function StudyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  const page = parseInt(searchParams.get("page") || "1");

  const [book, setBook] = useState<{ title: string; file_path: string; file_type: string } | null>(null);
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/books/${bookId}`)
      .then((r) => r.json())
      .then(setBook);
  }, [bookId]);

  const getPageText = useCallback(async (): Promise<string> => {
    if (!book || book.file_type !== "pdf") return "";
    try {
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const url = getBookUrl(book.file_path);
      const pdf = await pdfjs.getDocument(url).promise;
      const pdfPage = await pdf.getPage(page);
      const textContent = await pdfPage.getTextContent();
      return textContent.items.map((item) => ("str" in item ? (item as { str: string }).str : "")).join(" ");
    } catch {
      return "";
    }
  }, [book, page]);

  async function generate(tool: "summary" | "quiz" | "flashcards") {
    if (!book) return;
    setLoading(tool);
    try {
      const pageText = await getPageText();
      const res = await fetch("/api/ai/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, bookTitle: book.title, pageText, tool, pageRef: page }),
      });
      const data = await res.json();
      if (tool === "summary") setSummary(data.content);
      if (tool === "quiz") setQuiz(data.content);
      if (tool === "flashcards") setFlashcards(data.content);
    } catch {
      // error handled silently
    } finally {
      setLoading(null);
    }
  }

  if (!book) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Study Tools</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <BookOpen className="w-4 h-4" />
          <span>{book.title} - Page {page}</span>
        </div>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 mt-4">
          <Button onClick={() => generate("summary")} disabled={loading === "summary"}>
            {loading === "summary" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {summary ? "Regenerate Summary" : "Generate Summary"}
          </Button>
          {loading === "summary" ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : (
            <SummaryView summary={summary} />
          )}
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4 mt-4">
          <Button onClick={() => generate("quiz")} disabled={loading === "quiz"}>
            {loading === "quiz" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {quiz.length ? "Regenerate Quiz" : "Generate Quiz"}
          </Button>
          {loading === "quiz" ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <QuizView questions={quiz} onRegenerate={() => generate("quiz")} />
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4 mt-4">
          <Button onClick={() => generate("flashcards")} disabled={loading === "flashcards"}>
            {loading === "flashcards" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {flashcards.length ? "Regenerate Flashcards" : "Generate Flashcards"}
          </Button>
          {loading === "flashcards" ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-52 w-full max-w-lg rounded-2xl" />
            </div>
          ) : (
            <FlashcardView cards={flashcards} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
