"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronUp,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { formatTime, getLangCode, getThumbnail } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

function ControlButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * Spotify-style sticky player. Fixed to the bottom, persists across the
 * whole SPA, and exposes seek, transport, speed and volume controls for
 * the custom UI while the hidden engine does the actual playback.
 */
export function MiniPlayer() {
  const track = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const playbackRate = usePlayerStore((s) => s.playbackRate);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const openDetail = useUiStore((s) => s.openDetail);

  /** Local value while scrubbing so the audio only seeks on release. */
  const [scrub, setScrub] = useState<number | null>(null);
  const shown = scrub ?? currentTime;

  const cycleRate = () => {
    const index = PLAYBACK_RATES.indexOf(playbackRate);
    setPlaybackRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
  };

  return (
    <>
      {/* Reserves space so page content is never hidden behind the bar
          (taller on mobile where the controls wrap to two rows). */}
      {track && <div aria-hidden="true" className="h-32 sm:h-22" />}

      <AnimatePresence>
        {track && (
          <motion.div
            role="region"
            aria-label="Audio player"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="surface-glass fixed inset-x-0 bottom-0 z-40 border-t border-gold/15 pb-[env(safe-area-inset-bottom)]"
          >
            {/* Seek bar along the top edge */}
            <div className="absolute inset-x-0 -top-1.5 px-0">
              <Slider
                value={[Math.min(shown, duration || track.duration)]}
                min={0}
                max={duration || track.duration}
                step={1}
                aria-label="Seek"
                onValueChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  setScrub(v);
                }}
                onValueCommitted={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  seekTo(v);
                  setScrub(null);
                }}
                className="[&_[data-slot=slider-range]]:bg-gold [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-gold [&_[data-slot=slider-thumb]]:bg-gold-bright [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-muted"
              />
            </div>

            <div className="mx-auto grid max-w-screen-2xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6 lg:px-8">
              {/* Now playing info */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-gold/20">
                  <Image
                    src={getThumbnail(track)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openDetail(track)}
                    lang={getLangCode(track.language)}
                    dir="auto"
                    className="block w-full truncate text-left text-sm font-medium text-foreground transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:text-gold-bright"
                  >
                    {track.title}
                  </button>
                  <p className="truncate text-xs text-muted-foreground">
                    {track.speaker}
                  </p>
                </div>
              </div>

              {/* Transport */}
              <div className="flex items-center gap-1 sm:justify-center">
                <ControlButton
                  label="Previous lecture"
                  onClick={playPrevious}
                  className="hidden sm:flex"
                >
                  <SkipBack className="size-4 fill-current" aria-hidden="true" />
                </ControlButton>
                <ControlButton
                  label="Back 15 seconds"
                  onClick={() => seekTo(Math.max(0, currentTime - 15))}
                  className="hidden md:flex"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </ControlButton>

                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="mx-1 flex size-11 items-center justify-center rounded-full bg-gold text-night shadow-md shadow-gold/25 transition-all hover:scale-105 hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  {isPlaying ? (
                    <Pause className="size-5 fill-current" aria-hidden="true" />
                  ) : (
                    <Play
                      className="ml-0.5 size-5 fill-current"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <ControlButton
                  label="Forward 30 seconds"
                  onClick={() =>
                    seekTo(Math.min(duration || track.duration, currentTime + 30))
                  }
                  className="hidden md:flex"
                >
                  <RotateCw className="size-4" aria-hidden="true" />
                </ControlButton>
                <ControlButton
                  label="Next lecture"
                  onClick={playNext}
                  className="hidden sm:flex"
                >
                  <SkipForward
                    className="size-4 fill-current"
                    aria-hidden="true"
                  />
                </ControlButton>
              </div>

              {/* Time, speed, volume, expand */}
              <div className="col-span-2 -mt-1 flex items-center justify-between gap-3 sm:col-span-1 sm:mt-0 sm:justify-end">
                <p className="text-xs tabular-nums text-muted-foreground">
                  <span className="text-foreground">{formatTime(shown)}</span>
                  {" / "}
                  {formatTime(duration || track.duration)}
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={cycleRate}
                    aria-label={`Playback speed ${playbackRate} times. Change speed`}
                    className="hidden h-8 min-w-12 items-center justify-center rounded-full border border-border px-2 text-xs font-semibold tabular-nums text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:flex"
                  >
                    {playbackRate}×
                  </button>

                  <div className="hidden items-center gap-2 lg:flex">
                    <ControlButton
                      label={muted ? "Unmute" : "Mute"}
                      onClick={toggleMute}
                    >
                      {muted || volume === 0 ? (
                        <VolumeX className="size-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="size-4" aria-hidden="true" />
                      )}
                    </ControlButton>
                    <Slider
                      value={[muted ? 0 : Math.round(volume * 100)]}
                      min={0}
                      max={100}
                      step={1}
                      aria-label="Volume"
                      onValueChange={(value) => {
                        const v = Array.isArray(value) ? value[0] : value;
                        setVolume(v / 100);
                      }}
                      className="w-24 [&_[data-slot=slider-range]]:bg-gold [&_[data-slot=slider-thumb]]:size-2.5 [&_[data-slot=slider-thumb]]:border-gold [&_[data-slot=slider-thumb]]:bg-gold-bright"
                    />
                  </div>

                  <ControlButton
                    label="Expand player and show lecture details"
                    onClick={() => openDetail(track)}
                    className="text-gold hover:text-gold-bright"
                  >
                    <ChevronUp className="size-5" aria-hidden="true" />
                  </ControlButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
