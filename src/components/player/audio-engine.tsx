"use client";

import { useCallback, useEffect, useRef } from "react";
import H5AudioPlayer from "react-h5-audio-player";

import { usePlayerStore } from "@/store/player-store";

/**
 * Headless playback engine. react-h5-audio-player owns the single <audio>
 * element (hidden from view and the accessibility tree via `hidden`), while
 * the Zustand store stays the source of truth for every visible control.
 * Audio keeps playing while the user browses because this component lives
 * in the root layout and never remounts on navigation.
 */
export default function AudioEngine() {
  const playerRef = useRef<H5AudioPlayer>(null);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const pendingSeek = usePlayerStore((s) => s.pendingSeek);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const playbackRate = usePlayerStore((s) => s.playbackRate);

  const getAudio = useCallback(
    () => playerRef.current?.audio.current ?? null,
    []
  );

  /* Store -> element: play / pause */
  useEffect(() => {
    const audio = getAudio();
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch(() => {
        // Source unavailable or playback blocked: reflect reality in the UI.
        usePlayerStore.getState().setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, getAudio]);

  /* Store -> element: one-shot seeks (progress bar, resume position) */
  useEffect(() => {
    if (pendingSeek === null) return;
    const audio = getAudio();
    if (!audio) return;

    const apply = () => {
      audio.currentTime = pendingSeek;
      usePlayerStore.getState().clearPendingSeek();
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      apply();
      return;
    }
    // Hour-long Drive files may still be loading metadata; defer the seek.
    audio.addEventListener("loadedmetadata", apply, { once: true });
    return () => audio.removeEventListener("loadedmetadata", apply);
  }, [pendingSeek, getAudio]);

  /* Store -> element: volume, mute, speed */
  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted, getAudio]);

  useEffect(() => {
    const audio = getAudio();
    if (audio) audio.playbackRate = playbackRate;
  }, [playbackRate, getAudio]);

  if (!currentTrack) return null;

  return (
    <div hidden>
      <H5AudioPlayer
        ref={playerRef}
        src={currentTrack.audioUrl}
        autoPlayAfterSrcChange={isPlaying}
        preload="metadata"
        listenInterval={500}
        onListen={(e) => {
          const audio = e.target as HTMLAudioElement;
          usePlayerStore.getState().setCurrentTime(audio.currentTime);
        }}
        onLoadedMetaData={(e) => {
          const audio = e.target as HTMLAudioElement;
          usePlayerStore.getState().setDuration(audio.duration);
          // Loading a new source resets the element's rate; reapply.
          audio.playbackRate = usePlayerStore.getState().playbackRate;
        }}
        onPlay={() => usePlayerStore.getState().setIsPlaying(true)}
        onPause={() => {
          const audio = getAudio();
          if (!audio?.ended) usePlayerStore.getState().setIsPlaying(false);
        }}
        onEnded={() => usePlayerStore.getState().handleEnded()}
        onError={() => usePlayerStore.getState().setIsPlaying(false)}
        onPlayError={() => usePlayerStore.getState().setIsPlaying(false)}
      />
    </div>
  );
}
