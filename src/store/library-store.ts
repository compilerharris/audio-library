import { create } from "zustand";
import { EMPTY_FILTERS } from "@/lib/audio";
import type { LibraryFilters } from "@/types/audio";

interface LibraryState {
  query: string;
  filters: LibraryFilters;
  setQuery: (query: string) => void;
  /** Adds or removes a value from one of the multi-select filter groups. */
  toggleFilter: (group: keyof LibraryFilters, value: string) => void;
  clearGroup: (group: keyof LibraryFilters) => void;
  clearAll: () => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  query: "",
  filters: EMPTY_FILTERS,
  setQuery: (query) => set({ query }),
  toggleFilter: (group, value) =>
    set((state) => {
      const current = state.filters[group] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { filters: { ...state.filters, [group]: next } };
    }),
  clearGroup: (group) =>
    set((state) => ({ filters: { ...state.filters, [group]: [] } })),
  clearAll: () => set({ query: "", filters: EMPTY_FILTERS }),
}));

/** True when a query or any filter is narrowing the library. */
export function hasActiveRefinements(state: {
  query: string;
  filters: LibraryFilters;
}): boolean {
  return (
    state.query.trim().length > 0 ||
    Object.values(state.filters).some((group) => group.length > 0)
  );
}
