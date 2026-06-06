"use client";
import { UserButton } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-primary" />
        <span className="font-semibold">Okawe</span>
      </div>
      <UserButton  />
    </header>
  );
}
