"use client";
import { useState, useEffect } from "react";
import mammoth from "mammoth";
import { Loader2 } from "lucide-react";

interface DocxReaderProps {
  fileUrl: string;
  bookTitle: string;
}

export default function DocxReader({ fileUrl, bookTitle }: DocxReaderProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="p-3 border-b bg-muted/30">
        <h2 className="text-sm font-medium truncate">{bookTitle}</h2>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <article
          className="prose prose-sm dark:prose-invert max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
