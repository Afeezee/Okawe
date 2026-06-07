"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Home, Search, Bookmark, GraduationCap, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

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
  const [open, setOpen] = useState(false);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-9 w-9 bg-card border shadow-sm"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r bg-card z-50 h-full",
          // Desktop: always visible, static
          "lg:relative lg:translate-x-0 lg:w-60",
          // Mobile: fixed overlay, slide in/out
          "fixed top-0 left-0 w-64 transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Okawe</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
    </>
  );
}
