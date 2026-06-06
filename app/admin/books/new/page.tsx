import BookUploadForm from "@/components/admin/BookUploadForm";

export default function NewBookPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Upload New Book</h1>
      <p className="text-muted-foreground mb-8">Add a new book to the library catalogue</p>
      <BookUploadForm />
    </div>
  );
}
