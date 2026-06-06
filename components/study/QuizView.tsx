"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizViewProps {
  questions: QuizQuestion[];
  onRegenerate: () => void;
}

export default function QuizView({ questions, onRegenerate }: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions.length) return <p className="text-center text-muted-foreground">No quiz generated yet.</p>;

  const score = submitted
    ? questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
    : 0;

  function handleSubmit() {
    setSubmitted(true);
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
    onRegenerate();
  }

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-6">
      {submitted && (
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{score} / {questions.length}</p>
          <p className="text-muted-foreground">{Math.round((score / questions.length) * 100)}% correct</p>
        </div>
      )}

      {questions.map((q, qi) => (
        <div key={qi} className="rounded-xl border bg-card p-4 space-y-3">
          <p className="font-medium">
            {qi + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option) => {
              const isSelected = answers[qi] === option;
              const isCorrect = option === q.answer;
              return (
                <button
                  key={option}
                  onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [qi]: option }))}
                  disabled={submitted}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors",
                    submitted && isCorrect && "bg-green-500/20 border-green-500",
                    submitted && isSelected && !isCorrect && "bg-red-500/20 border-red-500",
                    !submitted && isSelected && "bg-primary/20 border-primary",
                    !submitted && !isSelected && "hover:bg-muted"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full">
            Submit Answers
          </Button>
        ) : (
          <Button onClick={handleReset} variant="outline" className="w-full">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
