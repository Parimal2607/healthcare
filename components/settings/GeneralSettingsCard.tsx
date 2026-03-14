"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserSettings {
  themePreference: "light" | "dark" | "system";
  timezone: string;
  dateFormat: string;
  landingPage: string;
  compactMode: boolean;
}

const defaultSettings: UserSettings = {
  themePreference: "system",
  timezone: "Asia/Calcutta",
  dateFormat: "DD/MM/YYYY",
  landingPage: "/dashboard",
  compactMode: false
};

export function GeneralSettingsCard() {
  const { toastError, toastSuccess } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = (await response.json()) as { settings?: UserSettings; error?: string };

        if (!response.ok) {
          const message = payload.error ?? "Unable to load settings.";
          setError(message);
          toastError("Settings load failed", message);
          return;
        }

        setSettings(payload.settings ?? defaultSettings);
      } catch {
        setError("Unable to load settings.");
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
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const payload = (await response.json()) as { settings?: UserSettings; error?: string };

      if (!response.ok) {
        const message = payload.error ?? "Unable to save settings.";
        setError(message);
        toastError("Settings save failed", message);
        return;
      }

      setSettings(payload.settings ?? settings);
      toastSuccess("Settings updated");
    } catch {
      setError("Unable to save settings.");
      toastError("Settings save failed", "Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading settings...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Theme Preference</p>
            <Select value={settings.themePreference} onValueChange={(v) => setSettings((p) => ({ ...p, themePreference: v as UserSettings["themePreference"] }))}>
              <SelectTrigger><SelectValue placeholder="Theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">light</SelectItem>
                <SelectItem value="dark">dark</SelectItem>
                <SelectItem value="system">system</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Timezone</p>
            <Input value={settings.timezone} onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))} />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Date Format</p>
            <Select value={settings.dateFormat} onValueChange={(v) => setSettings((p) => ({ ...p, dateFormat: v }))}>
              <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Landing Page</p>
            <Select value={settings.landingPage} onValueChange={(v) => setSettings((p) => ({ ...p, landingPage: v }))}>
              <SelectTrigger><SelectValue placeholder="Landing page" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="/dashboard">/dashboard</SelectItem>
                <SelectItem value="/patients">/patients</SelectItem>
                <SelectItem value="/analytics">/analytics</SelectItem>
                <SelectItem value="/notifications">/notifications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Compact Mode</p>
            <Select value={String(settings.compactMode)} onValueChange={(v) => setSettings((p) => ({ ...p, compactMode: v === "true" }))}>
              <SelectTrigger><SelectValue placeholder="Compact mode" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="false">off</SelectItem>
                <SelectItem value="true">on</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => void save()} disabled={isSaving}>
          Save General Settings
        </Button>
      </CardContent>
    </Card>
  );
}