import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getRecommendations } from "@/lib/groq";
import BookCard from "@/components/catalogue/BookCard";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const { data: sessions } = await db
    .from("reading_sessions")
    .select("*, books(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  const sessionList = sessions || [];
  const readBookIds = sessionList.map((s: { book_id: string }) => s.book_id);
  const readHistory = sessionList.map((s: { books: { title: string; subject: string | null } }) => ({
    title: s.books.title,
    subject: s.books.subject,
  }));

  const { data: allBooks } = await db
    .from("books")
    .select("id, title, subject, description, cover, author, level")
    .eq("is_published", true);

  const bookList = allBooks || [];

  let recommended: typeof bookList = [];
  try {
    const recommendedIds = await getRecommendations(readHistory, bookList, readBookIds);
    recommended = recommendedIds.map((id) => bookList.find((b) => b.id === id)).filter(Boolean) as typeof bookList;
  } catch {
    recommended = bookList.slice(0, 4);
  }

  const inProgress = sessionList.filter((s: { progress: number }) => s.progress > 0 && s.progress < 100);
  const completed = sessionList.filter((s: { progress: number }) => s.progress >= 100);

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Ready to continue your learning journey?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Books Started", value: sessionList.length },
          { label: "Completed", value: completed.length },
          { label: "In Progress", value: inProgress.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {inProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((session: { id: string; book_id: string; progress: number; last_page: number; books: { title: string; author: string } }) => (
              <Link key={session.id} href={`/book/${session.book_id}`}>
                <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                  <p className="font-medium truncate">{session.books.title}</p>
                  <p className="text-sm text-muted-foreground">{session.books.author}</p>
                  <Progress value={session.progress} className="mt-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(session.progress)}% complete - Page {session.last_page}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
        {recommended.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recommendations yet. Start reading to get personalized suggestions!</p>
        )}
      </section>
    </div>
  );
}
