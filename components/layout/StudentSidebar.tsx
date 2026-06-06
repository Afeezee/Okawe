"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Home, Search, Bookmark, GraduationCap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/catalogue", label: "Browse Books", icon: BookOpen },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as Record<string, string>)?.role === "admin";

  return (
    <aside className="w-60 flex flex-col border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Okawe</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t" />
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-muted-foreground">My Account</span>
      </div>
    </aside>
  );
}
