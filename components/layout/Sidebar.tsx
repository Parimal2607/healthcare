"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthUser();
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  const role = user?.role ?? "member";
  const allowedNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className={cn("rounded-lg border border-border bg-card p-3 transition-all", sidebarOpen ? "w-64" : "w-20")}>
      <div className="mb-4 flex h-10 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary">
            <HeartPulse className="h-4 w-4 text-foreground" />
          </div>
          <span className={cn("text-sm font-semibold text-foreground", !sidebarOpen && "hidden")}>HealthBridge</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="space-y-1">
        {allowedNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className={cn(!sidebarOpen && "hidden")}>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
