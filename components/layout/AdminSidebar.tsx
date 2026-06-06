"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, BookOpen, Users, GraduationCap, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/books", label: "Books", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col border-r bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Okawe</span>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Admin</span>
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

        <div className="my-3 border-t" />

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Student View
        </Link>
      </nav>

      <div className="p-4 border-t flex items-center gap-3">
        <UserButton />
        <span className="text-sm text-muted-foreground">Admin Account</span>
      </div>
    </aside>
  );
}
