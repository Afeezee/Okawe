"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const subjects = ["Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology", "Social Sciences", "Law", "Medicine"];
const levels = ["100L", "200L", "300L", "400L", "500L", "Postgraduate"];

export default function BookUploadForm({ initialData }: { initialData?: Record<string, unknown> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: (initialData?.title as string) || "",
    author: (initialData?.author as string) || "",
    description: (initialData?.description as string) || "",
    subject: (initialData?.subject as string) || "",
    level: (initialData?.level as string) || "",
    tags: (initialData?.tags as string) || "",
    is_published: initialData?.is_published !== false,
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFile(file: File, type: "document" | "cover"): Promise<{ filename: string; fileType?: string }> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    return res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let filePath = (initialData?.file_path as string) || "";
      let fileType = (initialData?.file_type as string) || "pdf";
      let cover = (initialData?.cover as string) || "";

      if (docFile) {
        const result = await uploadFile(docFile, "document");
        filePath = result.filename;
        fileType = result.fileType || "pdf";
      }
      if (coverFile) {
        const result = await uploadFile(coverFile, "cover");
        cover = result.filename;
      }

      if (!filePath && !initialData) {
        alert("Please upload a document file.");
        setLoading(false);
        return;
      }

      const bookData = {
        ...form,
        file_path: filePath,
        file_type: fileType,
        cover: cover || null,
      };

      if (initialData?.id) {
        await fetch(`/api/books/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      } else {
        await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      }

      router.push("/admin/books");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author *</Label>
        <Input id="author" value={form.author} onChange={(e) => updateField("author", e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <select
            id="subject"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            value={form.level}
            onChange={(e) => updateField("level", e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select level</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" value={form.tags} onChange={(e) => updateField("tags", e.target.value)} placeholder="e.g., algorithms, data structures" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doc">Document {!initialData && "*"}</Label>
          <Input
            id="doc"
            type="file"
            accept=".pdf,.docx,.epub"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">PDF, DOCX, or EPUB</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Cover Image</Label>
          <Input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={form.is_published}
          onChange={(e) => updateField("is_published", e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="published">Published</Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {initialData ? "Update Book" : "Upload Book"}
      </Button>
    </form>
  );
}
