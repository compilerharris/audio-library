import { create } from "zustand";
import { persist } from "zustand/middleware";

import { tracks as libraryTracks } from "@/lib/audio";
import type { AudioTrack } from "@/types/audio";

/** Resume slightly before where the listener left off, for context. */
const RESUME_REWIND_SECONDS = 3;
/** Don't bother resuming if less than this was played. */
const RESUME_MIN_SECONDS = 15;
/** Treat the lecture as finished when this close to the end. */
const RESUME_END_MARGIN_SECONDS = 30;
/** Throttle persisted progress writes (long lectures fire timeupdate ~4x/s). */
const PROGRESS_SAVE_INTERVAL_SECONDS = 5;

interface PlayerState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  /** Playback context: where next/previous navigate. */
  queue: AudioTrack[];

  /** Mirrors of the <audio> element, for custom UI (mini player, drawer). */
  currentTime: number;
  duration: number;

  /** One-shot seek request the audio element consumes and clears. */
  pendingSeek: number | null;

  volume: number;
  muted: boolean;
  playbackRate: number;

  /** Last saved position per track id, so hour-long lectures resume. */
  progress: Record<number, number>;

  /** Starts a track (toggles if already current). Optionally sets the queue. */
  playTrack: (track: AudioTrack, queue?: AudioTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  setIsPlaying: (isPlaying: boolean) => void;

  playNext: () => void;
  playPrevious: () => void;

  seekTo: (seconds: number) => void;
  clearPendingSeek: () => void;
  setCurrentTime: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  handleEnded: () => void;

  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
}

function resumePosition(
  progress: Record<number, number>,
  track: AudioTrack
): number | null {
  const saved = progress[track.id];
  if (
    saved !== undefined &&
    saved > RESUME_MIN_SECONDS &&
    saved < track.duration - RESUME_END_MARGIN_SECONDS
  ) {
    return Math.max(0, saved - RESUME_REWIND_SECONDS);
  }
  return null;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentTime: 0,
      duration: 0,
      pendingSeek: null,
      volume: 1,
      muted: false,
      playbackRate: 1,
      progress: {},

      playTrack: (track, queue) => {
        const state = get();
        if (state.currentTrack?.id === track.id) {
          set({
            isPlaying: !state.isPlaying,
            ...(queue ? { queue } : null),
          });
          return;
        }

        // Remember where the previous lecture was left off.
        const progress = state.currentTrack
          ? {
              ...state.progress,
              [state.currentTrack.id]: state.currentTime,
            }
          : state.progress;

        const nextQueue =
          queue ??
          (state.queue.some((t) => t.id === track.id)
            ? state.queue
            : libraryTracks);

        set({
          currentTrack: track,
          isPlaying: true,
          queue: nextQueue,
          currentTime: progress[track.id] ?? 0,
          duration: track.duration,
          pendingSeek: resumePosition(progress, track),
          progress,
        });
      },

      togglePlay: () => {
        const { currentTrack, isPlaying } = get();
        if (currentTrack) set({ isPlaying: !isPlaying });
      },

      pause: () => set({ isPlaying: false }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),

      playNext: () => {
        const { queue, currentTrack, playTrack } = get();
        if (!currentTrack || queue.length === 0) return;
        const index = queue.findIndex((t) => t.id === currentTrack.id);
        const next = queue[(index + 1) % queue.length];
        if (next && next.id !== currentTrack.id) playTrack(next, queue);
      },

      playPrevious: () => {
        const { queue, currentTrack, currentTime, seekTo, playTrack } = get();
        if (!currentTrack) return;
        // Spotify behavior: restart unless we're at the very beginning.
        if (currentTime > 4 || queue.length === 0) {
          seekTo(0);
          return;
        }
        const index = queue.findIndex((t) => t.id === currentTrack.id);
        const previous = queue[(index - 1 + queue.length) % queue.length];
        if (previous && previous.id !== currentTrack.id) {
          playTrack(previous, queue);
        } else {
          seekTo(0);
        }
      },

      seekTo: (seconds) =>
        set({ pendingSeek: Math.max(0, seconds), currentTime: seconds }),

      clearPendingSeek: () => set({ pendingSeek: null }),

      setCurrentTime: (seconds) => {
        const { currentTrack, progress } = get();
        if (!currentTrack) {
          set({ currentTime: seconds });
          return;
        }
        const lastSaved = progress[currentTrack.id] ?? 0;
        const shouldSave =
          Math.abs(seconds - lastSaved) >= PROGRESS_SAVE_INTERVAL_SECONDS;
        set({
          currentTime: seconds,
          ...(shouldSave
            ? { progress: { ...progress, [currentTrack.id]: seconds } }
            : null),
        });
      },

      setDuration: (seconds) => {
        if (Number.isFinite(seconds) && seconds > 0) {
          set({ duration: seconds });
        }
      },

      handleEnded: () => {
        const { currentTrack, progress, playNext, queue } = get();
        if (!currentTrack) return;
        // Finished lectures start from the top next time.
        const nextProgress = { ...progress };
        delete nextProgress[currentTrack.id];
        set({ progress: nextProgress, isPlaying: false, currentTime: 0 });
        if (queue.length > 1) playNext();
      },

      setVolume: (volume) =>
        set({ volume: Math.min(1, Math.max(0, volume)), muted: volume === 0 }),

      toggleMute: () => set((s) => ({ muted: !s.muted })),

      setPlaybackRate: (rate) => set({ playbackRate: rate }),
    }),
    {
      name: "noor-player",
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        playbackRate: state.playbackRate,
        progress: state.progress,
      }),
    }
  )
);
