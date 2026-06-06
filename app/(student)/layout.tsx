import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StudentSidebar from "@/components/layout/StudentSidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
