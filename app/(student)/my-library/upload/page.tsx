import UploadForm from "@/components/library/UploadForm";

export default function UploadBookPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Upload a Book</h1>
      <p className="text-muted-foreground mb-8">
        Your upload stays private to you. You can submit it for public listing — an admin will review it.
      </p>
      <UploadForm />
    </div>
  );
}
