"use client";

export default function SummaryView({ summary }: { summary: string }) {
  if (!summary) return <p className="text-center text-muted-foreground">No summary generated yet.</p>;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {summary.split("\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
