"use client";

import { useState } from "react";
import { GeneralSettingsCard } from "@/components/settings/GeneralSettingsCard";
import { NotificationPreferencesCard } from "@/components/settings/NotificationPreferencesCard";
import { PlatformIntegrationManager } from "@/components/settings/PlatformIntegrationManager";
import { Button } from "@/components/ui/button";

type SettingsSection = "general" | "notifications" | "platforms";

const sectionLabels: Record<SettingsSection, string> = {
  general: "General",
  notifications: "Notifications",
  platforms: "Platform Integrations"
};

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("general");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(sectionLabels) as SettingsSection[]).map((key) => (
          <Button
            key={key}
            variant={section === key ? "default" : "outline"}
            onClick={() => setSection(key)}
          >
            {sectionLabels[key]}
          </Button>
        ))}
      </div>

      {section === "general" ? <GeneralSettingsCard /> : null}
      {section === "notifications" ? <NotificationPreferencesCard /> : null}
      {section === "platforms" ? <PlatformIntegrationManager /> : null}
    </div>
  );
}