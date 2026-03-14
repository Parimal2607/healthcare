"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile, UserProfileResponse } from "@/types/user.types";

interface UpdateUserProfilePayload {
  fullName: string;
  organization: string;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = (await response.json()) as UserProfileResponse;

      if (!response.ok) {
        setError(data.error ?? "Unable to load profile.");
        return;
      }

      setProfile(data.profile);
    } catch {
      setError("Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (payload: UpdateUserProfilePayload) => {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as UserProfileResponse;

      if (!response.ok) {
        setError(data.error ?? "Unable to save profile.");
        return { ok: false };
      }

      setProfile(data.profile);
      return { ok: true };
    } catch {
      setError("Unable to save profile.");
      return { ok: false };
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    saveProfile
  };
}
