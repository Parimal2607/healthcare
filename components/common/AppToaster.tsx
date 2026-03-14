"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

export function AppToaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-md border p-3 shadow-md backdrop-blur-sm",
            toast.variant === "success" && "border-secondary bg-secondary/15 text-foreground",
            toast.variant === "error" && "border-destructive bg-destructive/15 text-foreground",
            toast.variant === "info" && "border-primary bg-primary/10 text-foreground"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-xs text-muted-foreground">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close toast"
              className="rounded-sm p-1 hover:bg-background/40"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
