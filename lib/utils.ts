import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getBookUrl(filename: string, type: "document" | "cover" = "document"): string {
  const bucket = type === "cover" ? "covers" : "documents";
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
}
