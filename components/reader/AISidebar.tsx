"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AISidebarProps {
  bookId: string;
  bookTitle: string;
  getPageText: () => Promise<string>;
  initialMessages?: Message[];
  onClose?: () => void;
}

export default function AISidebar({ bookId, bookTitle, getPageText, initialMessages = [], onClose }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const pageText = await getPageText();
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, bookTitle, pageText, question, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-l">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Reading Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMessages([])}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground mt-8 space-y-2">
            <Bot className="w-10 h-10 mx-auto opacity-30" />
            <p>Ask me anything about what you&apos;re reading.</p>
            <p className="text-xs">I can explain concepts, define terms, and answer questions about the current page.</p>
          </div>
        )}
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
              <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.content}
              </div>
              {msg.role === "user" && <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <Bot className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="bg-muted rounded-xl px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this page..."
          rows={2}
          className="resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="w-full" size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          {loading ? "Thinking..." : "Ask AI"}
        </Button>
      </div>
    </div>
  );
}
