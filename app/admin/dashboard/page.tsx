import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/clerk";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const { count: bookCount } = await db.from("books").select("*", { count: "exact", head: true });
  const { count: sessionCount } = await db.from("reading_sessions").select("*", { count: "exact", head: true });
  const { count: studyCount } = await db.from("study_sessions").select("*", { count: "exact", head: true });

  const { data: recentBooks } = await db
    .from("books")
    .select("id, title, author, subject, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: subjectCounts } = await db
    .from("books")
    .select("subject");

  const subjectMap: Record<string, number> = {};
  (subjectCounts || []).forEach((b: { subject: string | null }) => {
    const s = b.subject || "General";
    subjectMap[s] = (subjectMap[s] || 0) + 1;
  });
  const maxSubjectCount = Math.max(...Object.values(subjectMap), 1);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of the e-library system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Books", value: bookCount ?? 0 },
          { label: "Reading Sessions", value: sessionCount ?? 0 },
          { label: "Study Sessions", value: studyCount ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-4">Books by Subject</h2>
          <div className="space-y-3">
            {Object.entries(subjectMap).map(([subject, count]) => (
              <div key={subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{subject}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full transition-all"
                    style={{ width: `${(count / maxSubjectCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-4">Recent Uploads</h2>
          <div className="space-y-3">
            {(recentBooks || []).map((book: { id: string; title: string; author: string; subject: string | null; created_at: string }) => (
              <div key={book.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author} - {book.subject}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(book.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
