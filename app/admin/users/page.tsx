"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Shield, ShieldOff } from "lucide-react";

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string;
  role: string;
  createdAt: number;
  lastSignInAt: number | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "student" : "admin";
    setUpdating(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } finally {
      setUpdating(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.firstName?.toLowerCase() || "").includes(q) ||
      (u.lastName?.toLowerCase() || "").includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user roles and access control
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{adminCount}</p>
          <p className="text-sm text-muted-foreground">Admins</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-3xl font-bold">{studentCount}</p>
          <p className="text-sm text-muted-foreground">Students</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-left p-3 font-medium">Last Active</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role === "admin" ? "Admin" : "Student"}
                  </Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-muted-foreground">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString()
                    : "Never"}
                </td>
                <td className="p-3 text-right">
                  <Button
                    variant={user.role === "admin" ? "destructive" : "default"}
                    size="sm"
                    disabled={updating === user.id}
                    onClick={() => toggleRole(user.id, user.role)}
                  >
                    {updating === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.role === "admin" ? (
                      <>
                        <ShieldOff className="w-4 h-4 mr-1" /> Revoke Admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" /> Make Admin
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
