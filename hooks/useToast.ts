"use client";

import { useToastStore } from "@/store/useToastStore";

export function useToast() {
  const pushToast = useToastStore((state) => state.pushToast);

  return {
    toastSuccess: (title: string, message?: string) => pushToast({ variant: "success", title, message }),
    toastError: (title: string, message?: string) => pushToast({ variant: "error", title, message }),
    toastInfo: (title: string, message?: string) => pushToast({ variant: "info", title, message })
  };
}
