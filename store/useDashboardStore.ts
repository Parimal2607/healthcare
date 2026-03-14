import { create } from "zustand";

interface DashboardFilters {
  search: string;
  status: string;
}

interface DashboardState {
  selectedPatient: string | null;
  filters: DashboardFilters;
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  setSelectedPatient: (value: string | null) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedPatient: null,
  filters: { search: "", status: "all" },
  sidebarOpen: true,
  theme: "system",
  setSelectedPatient: (value) => set({ selectedPatient: value }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme })
}));
