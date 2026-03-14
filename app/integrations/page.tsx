"use client";

import { PlatformIntegrationManager } from "@/components/settings/PlatformIntegrationManager";

export default function IntegrationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Manage platform and EMR integrations</p>
      </div>
      <PlatformIntegrationManager />
    </div>
  );
}
