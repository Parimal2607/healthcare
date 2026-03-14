"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const setStoreTheme = useDashboardStore((state) => state.setTheme);

  function onThemeSelect(theme: "light" | "dark" | "system") {
    setTheme(theme);
    setStoreTheme(theme);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Sun className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onThemeSelect("light")}><Sun className="mr-2 h-4 w-4" />Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onThemeSelect("dark")}><Moon className="mr-2 h-4 w-4" />Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onThemeSelect("system")}><Monitor className="mr-2 h-4 w-4" />System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
