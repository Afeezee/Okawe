"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Loader2 } from "lucide-react";
import { getBookUrl } from "@/lib/utils";
import StatusBadge from "@/components/library/StatusBadge";
import SubjectSelect from "@/components/library/SubjectSelect";
import { LEVELS } from "@/lib/constants";

export interface MyBook {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  subject?: string | null;
  level?: string | null;
  tags?: string | null;
  cover?: string | null;
  visibility: string;
  rejection_reason?: string | null;
  rights_confirmed?: boolean;
}

export default function MyBookCard({ book }: { book: MyBook }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function call(url: string, method: string, body?: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Action failed.");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  }

  const canEdit = ["PRIVATE", "REJECTED"].includes(book.visibility);

  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
      <div className="relative h-40 bg-muted">
        {book.cover ? (
          <Image src={getBookUrl(book.cover, "cover")} alt={book.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={book.visibility} />
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
        </div>

        {book.visibility === "REJECTED" && book.rejection_reason && (
          <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
            Reason: {book.rejection_reason}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link href={`/book/${book.id}`}>
            <Button size="sm" variant="secondary">Read</Button>
          </Link>

          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} disabled={busy}>
              Edit
            </Button>
          )}

          {book.visibility === "PRIVATE" && (
            <Button size="sm" disabled={busy} onClick={() => call(`/api/my-books/${book.id}/submit`, "POST")}>
              Submit to Public Library
            </Button>
          )}

          {book.visibility === "REJECTED" && (
            <Button size="sm" disabled={busy} onClick={() => call(`/api/my-books/${book.id}/submit`, "POST")}>
              Resubmit
            </Button>
          )}

          {book.visibility === "PENDING" && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => call(`/api/my-books/${book.id}/withdraw`, "POST")}>
              Withdraw
            </Button>
          )}

          {canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              disabled={busy}
              onClick={() => {
                if (confirm("Delete this book? This cannot be undone.")) {
                  call(`/api/my-books/${book.id}`, "DELETE");
                }
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <EditDialog
        book={book}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={async (payload) => {
          const ok = await call(`/api/my-books/${book.id}`, "PATCH", payload);
          if (ok) setEditOpen(false);
        }}
        busy={busy}
      />
    </div>
  );
}

function EditDialog({
  book,
  open,
  onOpenChange,
  onSave,
  busy,
}: {
  book: MyBook;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: Record<string, unknown>) => void;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    description: book.description ?? "",
    subject: book.subject ?? "",
    level: book.level ?? "",
    tags: book.tags ?? "",
    rightsConfirmed: !!book.rights_confirmed,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit book</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="e-title">Title</Label>
            <Input id="e-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-author">Author</Label>
            <Input id="e-author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-desc">Description</Label>
            <Textarea id="e-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-subject">Subject</Label>
              <SubjectSelect id="e-subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-level">Level</Label>
              <select
                id="e-level"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-tags">Tags</Label>
            <Input id="e-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rightsConfirmed}
              onChange={(e) => setForm({ ...form, rightsConfirmed: e.target.checked })}
              className="mt-0.5 rounded"
            />
            <span>I confirm I have the right to share this material.</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button onClick={() => onSave(form)} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
