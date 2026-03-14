"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { sidebarOpen } = useDashboardStore();

  return (
    <div className="min-h-screen app-shell">
      <div className="relative flex h-screen w-full p-3 md:p-4">
        <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-3 transition-all",
            sidebarOpen ? "md:pl-64" : "md:pl-24"
          )}
        >
          <Header onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
          <main className="scroll-area flex-1 min-h-0 overflow-y-auto pb-6 pr-1">{children}</main>
        </div>
      </div>
    </div>
  );
}