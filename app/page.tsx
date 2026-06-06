import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, Search, Brain, GraduationCap, BarChart3, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingThemeToggle } from "@/components/theme/LandingThemeToggle";

const features = [
  { icon: Brain, title: "AI Reading Assistant", description: "Ask questions about any page and get instant, contextual explanations powered by AI." },
  { icon: Search, title: "Semantic Search", description: "Find books by meaning, not just keywords. Our AI understands what you're looking for." },
  { icon: Layers, title: "Smart Recommendations", description: "Get personalized book suggestions based on your reading history and interests." },
  { icon: GraduationCap, title: "Auto-Generated Quizzes", description: "Test your understanding with AI-generated multiple-choice questions from any page." },
  { icon: BookOpen, title: "Flashcard Generator", description: "Create study flashcards instantly from your reading material for effective revision." },
  { icon: BarChart3, title: "Progress Tracking", description: "Track your reading progress across all books with visual analytics and stats." },
];

const steps = [
  { step: "01", title: "Sign Up", description: "Create your free account in seconds and join the Okawe learning community." },
  { step: "02", title: "Browse & Read", description: "Explore our academic catalogue and read books directly in your browser." },
  { step: "03", title: "Learn with AI", description: "Use AI tools to study smarter — summaries, quizzes, flashcards, and more." },
];

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-xl">Okawe</span>
          </div>
          <div className="flex items-center gap-3">
            <LandingThemeToggle />
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Open Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Students studying together in a library"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-black/60" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            The Library That{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Reads With You
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Okawe is an AI-powered academic e-library built for students. Read digital textbooks, ask AI questions, generate quizzes, and study smarter — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8">
                  Start Reading Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link href="/catalogue">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explore Library
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Study Smarter</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Powered by AI, designed for academic excellence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 hover:shadow-lg transition-all group"
              >
                <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-xl flex items-center justify-center mx-auto">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">Okawe</span>
            <span className="text-muted-foreground text-sm">— meaning &quot;Reader&quot; in Yoruba</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Final Year Project &bull; Computer Science Department
          </p>
        </div>
      </footer>
    </div>
  );
}
