"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserRole, UserStatus } from "@/types/user.types";

interface TeamUser {
  id: string;
  full_name: string;
  email: string;
  organization: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

interface TeamUsersResponse {
  users?: TeamUser[];
  error?: string;
}

export default function TeamPage() {
  const { toastSuccess, toastError } = useToast();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users?scope=team&status=${statusFilter}`, { cache: "no-store" });
      const payload = (await response.json()) as TeamUsersResponse;

      if (!response.ok) {
        const message = payload.error ?? "Unable to load team users.";
        setError(message);
        toastError("Failed to load users", message);
        return;
      }

      setUsers(payload.users ?? []);
    } catch {
      setError("Unable to load team users.");
      toastError("Failed to load users", "Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [statusFilter]);

  const updateUser = async (userId: string, patch: Partial<Pick<TeamUser, "role" | "status">>) => {
    setIsSaving(userId);
    setError("");

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patch)
      });

      const payload = (await response.json()) as { user?: TeamUser; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to update user.";
        setError(message);
        toastError("Update failed", message);
        return;
      }

      setUsers((prev) => prev.map((item) => (item.id === userId ? ({ ...item, ...patch } as TeamUser) : item)));
      toastSuccess("User updated");
    } catch {
      setError("Unable to update user.");
      toastError("Update failed", "Please retry.");
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              <SelectItem value="active">active</SelectItem>
              <SelectItem value="inactive">inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void loadUsers()} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managers and Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>1. This table shows manager/member accounts for admin control.</p>
          <p>2. Admin can change role between manager/member/admin and update active/inactive status.</p>
          <p>3. Inactive users cannot access private routes.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading users...</p> : null}
          {error ? <p className="mb-2 text-sm text-destructive">{error}</p> : null}
          {!isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => void updateUser(user.id, { role: value as UserRole })}
                        disabled={isSaving === user.id}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">admin</SelectItem>
                          <SelectItem value="manager">manager</SelectItem>
                          <SelectItem value="member">member</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.status}
                        onValueChange={(value) => void updateUser(user.id, { status: value as UserStatus })}
                        disabled={isSaving === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="inactive">inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{new Date(user.created_at).toLocaleDateString()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

