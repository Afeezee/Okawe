"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardView({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) return <p className="text-center text-muted-foreground">No flashcards generated.</p>;

  const card = cards[index];

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-sm text-muted-foreground">
        Card {index + 1} of {cards.length} — click card to flip
      </p>

      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          "w-full max-w-lg h-52 rounded-2xl border-2 cursor-pointer flex items-center justify-center p-8 text-center transition-all duration-300 select-none",
          flipped ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/50"
        )}
      >
        <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => { setIndex(Math.max(0, index - 1)); setFlipped(false); }}
          disabled={index === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setFlipped(!flipped)}>
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => { setIndex(Math.min(cards.length - 1, index + 1)); setFlipped(false); }}
          disabled={index === cards.length - 1}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
