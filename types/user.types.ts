export type UserRole = "admin" | "manager" | "member";
export type UserStatus = "active" | "inactive";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  organization: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  profile: UserProfile | null;
  error?: string;
}
