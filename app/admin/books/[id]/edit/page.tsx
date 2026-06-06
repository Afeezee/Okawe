import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/clerk";
import BookUploadForm from "@/components/admin/BookUploadForm";
import { notFound } from "next/navigation";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const { data: book } = await db.from("books").select("*").eq("id", id).single();

  if (!book) notFound();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Edit Book</h1>
      <p className="text-muted-foreground mb-8">Update book details</p>
      <BookUploadForm initialData={book} />
    </div>
  );
}
