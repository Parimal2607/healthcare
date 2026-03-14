"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, HeartPulse, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/constants";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthUser();
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  const role = user?.role ?? "member";
  const allowedNavItems = navItems.filter((item) => item.roles.includes(role));

  const Logo = (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <HeartPulse className="h-5 w-5" />
      </div>
      <div className={cn(!sidebarOpen && "hidden")}>
        <p className="text-sm font-semibold leading-none">PulseBridge</p>
        <p className="text-xs text-muted-foreground">Health Exchange</p>
      </div>
    </div>
  );

  const links = (
    <nav className="space-y-1">
      {allowedNavItems.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={() => onMobileClose?.()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className={cn(!sidebarOpen && "hidden")}>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:gap-4  border border-border bg-card/95 p-3 shadow-sm transition-all",
          sidebarOpen ? "md:w-64" : "md:w-20"
        )}
      >
        <div className="flex h-12 items-center justify-between">
          {Logo}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        <div className="scroll-area flex-1 overflow-y-auto pr-1">{links}</div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button className="absolute inset-0 bg-black/40" onClick={onMobileClose} aria-label="Close sidebar" />
          <aside className="relative h-full w-72 border-r border-border bg-card p-3 shadow-lg">
            <div className="mb-4 flex h-10 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">PulseBridge</p>
                  <p className="text-xs text-muted-foreground">Health Exchange</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onMobileClose} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {links}
          </aside>
        </div>
      ) : null}
    </>
  );
}