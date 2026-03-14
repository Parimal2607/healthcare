"use client";

import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">View and manage your notifications</p>
      </div>
      <NotificationCenter />
    </div>
  );
}
