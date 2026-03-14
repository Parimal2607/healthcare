import { useEffect, useState } from "react";
import type { UserRole, UserStatus } from "@/types/user.types";

interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  organization: string | null;
  role: UserRole;
  status: UserStatus;
}

interface MeResponse {
  user: AuthUser | null;
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok || !isMounted) {
          return;
        }

        const data = (await response.json()) as MeResponse;
        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        // Silently ignore and keep null user in client hook.
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, isLoading };
}
