import type { Provider } from "@/types/provider.types";

export const providers: Provider[] = [
  { id: "PR-001", name: "Dr. Hannah Lee", specialty: "Cardiology", organization: "Mercy Health Network", patientsManaged: 182, status: "Active" },
  { id: "PR-002", name: "Dr. Arjun Mehta", specialty: "Endocrinology", organization: "Northwell Partners", patientsManaged: 146, status: "Active" },
  { id: "PR-003", name: "Dr. Alicia Gomez", specialty: "Family Medicine", organization: "CityCare Group", patientsManaged: 210, status: "Onboarding" }
];
