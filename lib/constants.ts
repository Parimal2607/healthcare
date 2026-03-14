import {
  BarChart3,
  Building2,
  FileCheck2,
  LayoutDashboard,
  Plug,
  Settings,
  ShieldCheck,
  Stethoscope,
  ReceiptText,
  ClipboardList,
  Users,
  type LucideIcon
} from "lucide-react";
import type { UserRole } from "@/types/user.types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "member"] },
  { label: "Patients", href: "/patients", icon: Users, roles: ["admin", "manager", "member"] },
  { label: "Providers", href: "/providers", icon: Building2, roles: ["admin", "manager", "member"] },
  { label: "Encounters", href: "/encounters", icon: ClipboardList, roles: ["admin", "manager", "member"] },
  { label: "Observations", href: "/observations", icon: Stethoscope, roles: ["admin", "manager", "member"] },
  { label: "Claims", href: "/claims", icon: ReceiptText, roles: ["admin", "manager", "member"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager", "member"] },
  { label: "Consent", href: "/consent", icon: FileCheck2, roles: ["admin", "manager", "member"] },
  { label: "Integrations", href: "/integrations", icon: Plug, roles: ["admin", "manager", "member"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["admin", "manager", "member"] },
  { label: "Team", href: "/team", icon: ShieldCheck, roles: ["admin"] }
];
