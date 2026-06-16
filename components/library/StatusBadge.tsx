import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  PRIVATE: { label: "Private", cls: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200" },
  PENDING: { label: "Awaiting approval", cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  PUBLIC: { label: "Published", cls: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.PRIVATE;
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.cls)}>{s.label}</span>
  );
}
