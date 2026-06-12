"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Globe,
  Mic2,
  Pause,
  Play,
  Tag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Waveform } from "@/components/hero/waveform";
import {
  formatDate,
  formatDuration,
  formatTime,
  getLangCode,
  getRelatedTracks,
  getThumbnail,
} from "@/lib/audio";
import { usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";
import type { AudioTrack } from "@/types/audio";

function RelatedRow({ track }: { track: AudioTrack }) {
  const openDetail = useUiStore((s) => s.openDetail);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playing = usePlayerStore(
    (s) => s.currentTrack?.id === track.id && s.isPlaying
  );

  return (
    <li className="group relative flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-gold/20 hover:bg-gold/5">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-gold/15">
        <Image
          src={getThumbnail(track)}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-foreground">
          <button
            type="button"
            onClick={() => openDetail(track)}
            lang={getLangCode(track.language)}
            dir="auto"
            className="block w-full truncate text-left transition-colors after:absolute after:inset-0 after:content-[''] hover:text-gold-bright focus-visible:outline-none focus-visible:text-gold-bright"
          >
            {track.title}
          </button>
        </h4>
        <p className="truncate text-xs text-muted-foreground">
          {track.speaker} · {formatDuration(track.duration)}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          playTrack(track);
        }}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
        className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-night focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        {playing ? (
          <Pause className="size-4 fill-current" aria-hidden="true" />
        ) : (
          <Play className="ml-0.5 size-4 fill-current" aria-hidden="true" />
        )}
      </button>
    </li>
  );
}

/**
 * Audio detail drawer: opens in place (no navigation), shows the full
 * lecture metadata, an inline player bound to the global engine, and
 * related suggestions.
 */
export function AudioDetailDrawer() {
  const track = useUiStore((s) => s.detailTrack);
  const isOpen = useUiStore((s) => s.isDetailOpen);
  const closeDetail = useUiStore((s) => s.closeDetail);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const isCurrent = usePlayerStore(
    (s) => s.currentTrack !== null && s.currentTrack.id === track?.id
  );
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const [scrub, setScrub] = useState<number | null>(null);

  const related = useMemo(
    () => (track ? getRelatedTracks(track) : []),
    [track]
  );

  if (!track) return null;

  const playing = isCurrent && isPlaying;
  const totalSeconds = isCurrent ? duration || track.duration : track.duration;
  const shownTime = isCurrent ? scrub ?? currentTime : 0;

  const meta = [
    { icon: Mic2, label: "Speaker", value: track.speaker },
    { icon: Tag, label: "Category", value: track.category },
    { icon: Globe, label: "Language", value: track.language },
    { icon: Calendar, label: "Published", value: formatDate(track.date) },
    { icon: Clock, label: "Duration", value: formatDuration(track.duration) },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-gold/15 bg-surface p-0 sm:max-w-md lg:max-w-lg"
      >
        {/* Large cover */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
          <Image
            key={track.id}
            src={getThumbnail(track)}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 32rem"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
          <div className="absolute bottom-4 left-5 flex gap-2">
            <Badge className="border-gold/30 bg-night/70 text-gold backdrop-blur-md">
              {track.category}
            </Badge>
            <Badge className="border-border bg-night/70 text-sand backdrop-blur-md">
              {track.language}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="space-y-2">
            <SheetTitle
              lang={getLangCode(track.language)}
              dir="auto"
              className="font-display text-2xl font-semibold leading-snug"
            >
              {track.title}
            </SheetTitle>
            <SheetDescription className="text-sm text-gold">
              {track.speaker}
            </SheetDescription>
          </div>

          {/* Inline player bound to the global engine */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-gold/15 bg-night/40 p-5"
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => playTrack(track)}
                aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold text-night shadow-lg shadow-gold/25 transition-all hover:scale-105 hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {playing ? (
                  <Pause className="size-6 fill-current" aria-hidden="true" />
                ) : (
                  <Play
                    className="ml-0.5 size-6 fill-current"
                    aria-hidden="true"
                  />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <Waveform playing={playing} bars={36} className="h-9 w-full" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Slider
                value={[Math.min(shownTime, totalSeconds)]}
                min={0}
                max={totalSeconds}
                step={1}
                disabled={!isCurrent}
                aria-label="Seek within this lecture"
                onValueChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  setScrub(v);
                }}
                onValueCommitted={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  seekTo(v);
                  setScrub(null);
                }}
                className="[&_[data-slot=slider-range]]:bg-gold [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:border-gold [&_[data-slot=slider-thumb]]:bg-gold-bright [&_[data-slot=slider-track]]:bg-muted"
              />
              <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
                <span>{formatTime(shownTime)}</span>
                <span>{formatTime(totalSeconds)}</span>
              </div>
            </div>
          </motion.div>

          {/* Metadata */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {meta.map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-1">
                <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Icon className="size-3 text-gold/70" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <Separator className="bg-border" />

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              About this lecture
            </h3>
            <p
              lang={getLangCode(track.language)}
              dir="auto"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {track.description}
            </p>
          </div>

          {related.length > 0 && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Related lectures
                </h3>
                <ul className="-mx-2 space-y-1">
                  {related.map((r) => (
                    <RelatedRow key={r.id} track={r} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
