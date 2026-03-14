import type { Patient } from "@/types/patient.types";

export const patients: Patient[] = [
  { id: "PT-1001", name: "Emma Carter", age: 45, gender: "Female", lastVisit: "2026-03-03", status: "Active", providerId: "PR-001" },
  { id: "PT-1002", name: "Noah Bennett", age: 62, gender: "Male", lastVisit: "2026-03-10", status: "Critical", providerId: "PR-002" },
  { id: "PT-1003", name: "Sophia Ramos", age: 31, gender: "Female", lastVisit: "2026-02-24", status: "Active", providerId: "PR-003" },
  { id: "PT-1004", name: "Liam Shah", age: 52, gender: "Male", lastVisit: "2026-01-15", status: "Inactive", providerId: "PR-001" },
  { id: "PT-1005", name: "Olivia Brooks", age: 27, gender: "Female", lastVisit: "2026-03-05", status: "Active", providerId: "PR-002" },
  { id: "PT-1006", name: "James Nguyen", age: 39, gender: "Male", lastVisit: "2026-02-26", status: "Active", providerId: "PR-003" }
];
