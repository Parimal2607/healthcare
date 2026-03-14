"use client";

import { useRouter } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const router = useRouter();
  const { user } = useAuthUser();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="User menu">
          <UserCircle2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel className="truncate">{user.fullName ?? user.email}</DropdownMenuLabel>
            <DropdownMenuLabel className="truncate pt-0 text-xs font-normal text-muted-foreground">{user.email}</DropdownMenuLabel>
            <DropdownMenuLabel className="truncate pt-0 text-xs font-normal text-muted-foreground">
              Role: {user.role}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>
        {user?.role === "admin" ? (
          <DropdownMenuItem asChild>
            <a href="/team">Team</a>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
