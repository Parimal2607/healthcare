"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const { profile, isLoading, isSaving, error, saveProfile } = useUserProfile();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");

  const resolvedName = useMemo(() => fullName || profile?.full_name || "", [fullName, profile?.full_name]);
  const resolvedOrganization = useMemo(
    () => organization || profile?.organization || "",
    [organization, profile?.organization]
  );

  const onEditProfile = async () => {
    if (!resolvedName || !resolvedOrganization) return;
    await saveProfile({ fullName: resolvedName, organization: resolvedOrganization });
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <Input value={resolvedName} onChange={(event) => setFullName(event.target.value)} />
          </div>
          <p>
            <span className="text-muted-foreground">Role:</span> {profile?.role ?? "member"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {profile?.email ?? "-"}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Organization</p>
            <Input value={resolvedOrganization} onChange={(event) => setOrganization(event.target.value)} />
          </div>
          <p className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="secondary">{profile?.status ?? "active"}</Badge>
          </p>
          <p>
            <span className="text-muted-foreground">Joined:</span>{" "}
            {profile?.created_at ? new Date(profile.created_at).toLocaleString() : "-"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEditProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Notification Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
