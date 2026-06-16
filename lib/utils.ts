import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getBookUrl(filename: string, type: "document" | "cover" = "document"): string {
  // Covers are public and served straight from storage.
  if (type === "cover") {
    return `${SUPABASE_URL}/storage/v1/object/public/covers/${filename}`;
  }
  // Documents always go through the access-checked API route so private
  // books can't be fetched by guessing the storage URL.
  return `/api/files/documents/${filename}`;
}
