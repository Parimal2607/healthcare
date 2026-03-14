"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/useToast";
import { TablePagination } from "@/components/common/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "general" | "security" | "claims" | "consent" | "integration" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function NotificationCenter() {
  const { toastError, toastSuccess } = useToast();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedStatus = useDebouncedValue(status, 200);
  const debouncedCategory = useDebouncedValue(category, 200);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("status", debouncedStatus);
      params.set("category", debouncedCategory);
      params.set("page", String(page));
      params.set("pageSize", "10");

      const response = await fetch(`/api/notifications?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        notifications?: NotificationItem[];
        pagination?: PaginationMeta;
        error?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Unable to load notifications.";
        setError(message);
        toastError("Notification load failed", message);
        setItems([]);
        return;
      }

      const filtered = payload.notifications ?? [];
      const bySearch = debouncedSearch.trim()
        ? filtered.filter((item) =>
            `${item.title} ${item.message}`.toLowerCase().includes(debouncedSearch.trim().toLowerCase())
          )
        : filtered;

      setItems(bySearch);
      setTotal(payload.pagination?.total ?? 0);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch {
      setError("Unable to load notifications.");
      toastError("Notification load failed", "Please retry.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [debouncedStatus, debouncedCategory, debouncedSearch, page]);

  const markRead = async (id: string) => {
    const response = await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toastError("Mark as read failed", payload.error ?? "Unable to mark notification as read.");
      return;
    }

    toastSuccess("Notification marked as read");
    await load();
  };

  const markAllRead = async () => {
    const response = await fetch("/api/notifications?action=markAllRead", { method: "PATCH" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      toastError("Mark all as read failed", payload.error ?? "Unable to mark all notifications as read.");
      return;
    }

    toastSuccess("All notifications marked as read");
    await load();
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Notifications</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search notifications"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="unread">unread</SelectItem>
                <SelectItem value="read">read</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                <SelectItem value="security">security</SelectItem>
                <SelectItem value="claims">claims</SelectItem>
                <SelectItem value="consent">consent</SelectItem>
                <SelectItem value="integration">integration</SelectItem>
                <SelectItem value="system">system</SelectItem>
                <SelectItem value="general">general</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => void markAllRead()}>
              Mark All Read
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading notifications...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!isLoading && !error ? (
        <>
          {items.length === 0 ? <p className="text-sm text-muted-foreground">No notifications found.</p> : null}
          <div className="space-y-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <Badge variant={item.is_read ? "outline" : "secondary"}>{item.is_read ? "read" : "unread"}</Badge>
                        <Badge variant={item.priority === "urgent" || item.priority === "high" ? "destructive" : "outline"}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.is_read ? (
                        <Button size="sm" variant="outline" onClick={() => void markRead(item.id)}>
                          Mark Read
                        </Button>
                      ) : null}
                      {item.action_url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            window.location.href = item.action_url as string;
                          }}
                        >
                          Open
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </>
      ) : null}
    </div>
  );
}