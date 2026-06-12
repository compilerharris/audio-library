"use client";

import dynamic from "next/dynamic";

import { MiniPlayer } from "@/components/player/mini-player";
import { usePlayerStore } from "@/store/player-store";

/**
 * The playback engine (react-h5-audio-player) is loaded lazily on the
 * client only once the user actually starts a lecture, keeping it out
 * of the initial bundle.
 */
const AudioEngine = dynamic(() => import("@/components/player/audio-engine"), {
  ssr: false,
});

export function PlayerDock() {
  const hasTrack = usePlayerStore((s) => s.currentTrack !== null);

  return (
    <>
      {hasTrack && <AudioEngine />}
      <MiniPlayer />
    </>
  );
}
