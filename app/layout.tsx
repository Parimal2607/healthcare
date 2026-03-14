import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppToaster } from "@/components/common/AppToaster";
import { ThemeProvider } from "@/components/common/ThemeProvider";

export const metadata: Metadata = {
  title: "Healthcare Data Exchange Platform",
  description: "Unified Healthcare Data Platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
