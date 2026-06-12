import { create } from "zustand";
import type { AudioTrack } from "@/types/audio";

interface UiState {
  /** Track shown in the detail drawer. Kept on close so exit animations have data. */
  detailTrack: AudioTrack | null;
  isDetailOpen: boolean;
  isDonationOpen: boolean;
  openDetail: (track: AudioTrack) => void;
  closeDetail: () => void;
  setDonationOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  detailTrack: null,
  isDetailOpen: false,
  isDonationOpen: false,
  openDetail: (track) => set({ detailTrack: track, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false }),
  setDonationOpen: (open) => set({ isDonationOpen: open }),
}));
