"use client";

import { useUserProfile } from "@/hooks/useUserProfile";

export default function ProfilePage() {
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading profile...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">View and edit your profile</p>
      </div>
      {profile ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="font-medium">{profile.full_name ?? profile.email}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">No profile found.</p>
      )}
    </div>
  );
}
