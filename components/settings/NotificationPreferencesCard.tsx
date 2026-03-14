"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  smsEnabled: boolean;
  securityAlerts: boolean;
  consentUpdates: boolean;
  claimsUpdates: boolean;
  integrationAlerts: boolean;
  weeklyDigest: boolean;
}

const defaultPreferences: NotificationPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  smsEnabled: false,
  securityAlerts: true,
  consentUpdates: true,
  claimsUpdates: true,
  integrationAlerts: true,
  weeklyDigest: false
};

export function NotificationPreferencesCard() {
  const { toastError, toastSuccess } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/notification-preferences", { cache: "no-store" });
        const payload = (await response.json()) as { preferences?: NotificationPreferences; error?: string };

        if (!response.ok) {
          const message = payload.error ?? "Unable to load notification preferences.";
          setError(message);
          toastError("Notification settings load failed", message);
          return;
        }

        setPreferences(payload.preferences ?? defaultPreferences);
      } catch {
        setError("Unable to load notification preferences.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const save = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences)
      });
      const payload = (await response.json()) as { preferences?: NotificationPreferences; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save notification preferences.";
        setError(message);
        toastError("Notification settings save failed", message);
        return;
      }

      setPreferences(payload.preferences ?? preferences);
      toastSuccess("Notification settings updated");
    } catch {
      setError("Unable to save notification preferences.");
      toastError("Notification settings save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const yesNo = (value: boolean) => String(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading notification settings...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { key: "emailEnabled", label: "Email Notifications" },
            { key: "inAppEnabled", label: "In-App Notifications" },
            { key: "smsEnabled", label: "SMS Notifications" },
            { key: "securityAlerts", label: "Security Alerts" },
            { key: "consentUpdates", label: "Consent Updates" },
            { key: "claimsUpdates", label: "Claims Updates" },
            { key: "integrationAlerts", label: "Integration Alerts" },
            { key: "weeklyDigest", label: "Weekly Digest" }
          ].map((item) => (
            <div className="space-y-1" key={item.key}>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <Select
                value={yesNo(preferences[item.key as keyof NotificationPreferences] as boolean)}
                onValueChange={(value) =>
                  setPreferences((prev) => ({ ...prev, [item.key]: value === "true" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={item.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">enabled</SelectItem>
                  <SelectItem value="false">disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button onClick={() => void save()} disabled={isSaving}>
          Save Notification Preferences
        </Button>
      </CardContent>
    </Card>
  );
}