import type { Metadata } from "next";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { AppToaster } from "@/components/common/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseBridge - Health Exchange",
  description: "Healthcare SaaS platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
