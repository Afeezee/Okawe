"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { LEVELS } from "@/lib/constants";
import SubjectSelect from "@/components/library/SubjectSelect";

export interface PendingBook {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  subject?: string | null;
  level?: string | null;
  tags?: string | null;
  uploader_name?: string | null;
}

type CreditMode = "uploader" | "anonymous" | "custom";

export default function ModerationCard({ book }: { book: PendingBook }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState({
    title: book.title,
    author: book.author,
    description: book.description ?? "",
    subject: book.subject ?? "",
    level: book.level ?? "",
    tags: book.tags ?? "",
  });
  const [creditMode, setCreditMode] = useState<CreditMode>("uploader");
  const [customCredit, setCustomCredit] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  function resolveCredit(): string | null {
    if (creditMode === "anonymous") return null;
    if (creditMode === "custom") return customCredit.trim() || null;
    return book.uploader_name || null;
  }

  async function post(body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(`/api/moderation/${book.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Action failed.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    post({ action: "approve", edits, contributorCredit: resolveCredit() });
  }

  function reject() {
    if (!rejectionReason.trim()) {
      alert("A rejection reason is required.");
      return;
    }
    post({ action: "reject", rejectionReason });
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Uploaded by <span className="font-medium text-foreground">{book.uploader_name || "Anonymous"}</span>
        </p>
        <Link href={`/book/${book.id}`} target="_blank">
          <Button size="sm" variant="secondary">Preview</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Title</Label>
          <Input value={edits.title} onChange={(e) => setEdits({ ...edits, title: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Author</Label>
          <Input value={edits.author} onChange={(e) => setEdits({ ...edits, author: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea rows={2} value={edits.description} onChange={(e) => setEdits({ ...edits, description: e.target.value })} />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Subject</Label>
          <SubjectSelect value={edits.subject} onChange={(v) => setEdits({ ...edits, subject: v })} />
        </div>
        <div className="space-y-1">
          <Label>Level</Label>
          <select
            value={edits.level}
            onChange={(e) => setEdits({ ...edits, level: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Tags</Label>
          <Input value={edits.tags} onChange={(e) => setEdits({ ...edits, tags: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Contributor credit</Label>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={creditMode}
            onChange={(e) => setCreditMode(e.target.value as CreditMode)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="uploader">Credit uploader ({book.uploader_name || "Anonymous"})</option>
            <option value="anonymous">Anonymous (book author only)</option>
            <option value="custom">Custom…</option>
          </select>
          {creditMode === "custom" && (
            <Input
              placeholder="Credit text"
              value={customCredit}
              onChange={(e) => setCustomCredit(e.target.value)}
              className="max-w-xs"
            />
          )}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[12rem] space-y-1">
            <Label>Rejection reason (required to reject)</Label>
            <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="e.g., low quality scan" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600" disabled={busy} onClick={reject}>
              Reject
            </Button>
            <Button disabled={busy} onClick={approve}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Approve &amp; Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
