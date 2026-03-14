"use client";

import { GeneralSettingsCard } from "@/components/settings/GeneralSettingsCard";
import { NotificationPreferencesCard } from "@/components/settings/NotificationPreferencesCard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <GeneralSettingsCard />
        <NotificationPreferencesCard />
      </div>
    </div>
  );
}
