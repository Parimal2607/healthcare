export interface Provider {
  id: string;
  name: string;
  specialty: string;
  organization: string;
  patientsManaged: number;
  status: "Active" | "Onboarding" | "Inactive";
}
