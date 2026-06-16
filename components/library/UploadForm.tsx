"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { LEVELS } from "@/lib/constants";
import SubjectSelect from "@/components/library/SubjectSelect";

const MAX_BYTES = 50 * 1024 * 1024;

export default function UploadForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<"private" | "public" | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    subject: "",
    level: "",
    tags: "",
  });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadFile(file: File, type: "document" | "cover"): Promise<{ filename: string; fileType?: string; error?: string }> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    return res.json();
  }

  async function submit(submitForPublic: boolean) {
    setError("");

    if (!form.title.trim()) return setError("Title is required.");
    if (!docFile) return setError("Please choose a PDF file.");
    if (docFile.type !== "application/pdf") return setError("Only PDF files are allowed.");
    if (docFile.size > MAX_BYTES) return setError("File exceeds the 50 MB limit.");
    if (submitForPublic && !rightsConfirmed) return setError("Confirm your sharing rights to submit publicly.");

    setLoading(submitForPublic ? "public" : "private");
    try {
      const docResult = await uploadFile(docFile, "document");
      if (docResult.error || !docResult.filename) {
        setError(docResult.error || "Upload failed.");
        return;
      }

      let cover: string | null = null;
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, "cover");
        cover = coverResult.filename ?? null;
      }

      const res = await fetch("/api/my-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          filePath: docResult.filename,
          cover,
          rightsConfirmed,
          submitForPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save your book.");
        return;
      }

      router.push("/my-library");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input id="author" value={form.author} onChange={(e) => updateField("author", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <SubjectSelect id="subject" value={form.subject} onChange={(v) => updateField("subject", v)} />
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
            {LEVELS.map((l) => (
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
          <Label htmlFor="doc">PDF file *</Label>
          <Input id="doc" type="file" accept=".pdf,application/pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-muted-foreground">PDF only, max 50 MB</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Cover image (optional)</Label>
          <Input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={rightsConfirmed}
          onChange={(e) => setRightsConfirmed(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span>
          I confirm I have the right to share this material (my own work, open-access, or public domain).
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="button" variant="outline" disabled={loading !== null} onClick={() => submit(false)} className="flex-1">
          {loading === "private" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save to My Library
        </Button>
        <Button type="button" disabled={loading !== null || !rightsConfirmed} onClick={() => submit(true)} className="flex-1">
          {loading === "public" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save &amp; Submit for Public Listing
        </Button>
      </div>
    </form>
  );
}
