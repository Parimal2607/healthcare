import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen gap-3 bg-background p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
