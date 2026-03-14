"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?status=unread&page=1&pageSize=1", { cache: "no-store" });
        if (!response.ok || !isMounted) return;
        const payload = (await response.json()) as { pagination?: { total?: number } };
        if (isMounted) setUnreadCount(payload.pagination?.total ?? 0);
      } catch {
        // keep default
      }
    };

    void loadUnreadCount();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="flex h-14 items-center gap-2 rounded-lg border border-border bg-card px-3">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients, providers, claims..." className="pl-9" />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          onClick={() => {
            window.location.href = "/notifications";
          }}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" /> : null}
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}