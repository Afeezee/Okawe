import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

export async function getRole(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "student";
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata as Record<string, string>)?.role ?? "student";
}

export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const role = await getRole();
  if (role !== "admin") redirect("/dashboard");
  return userId;
}
