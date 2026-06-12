"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Globe, Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatDuration,
  getLangCode,
  getThumbnail,
} from "@/lib/audio";
import { usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";
import type { AudioTrack } from "@/types/audio";

interface AudioCardProps {
  track: AudioTrack;
  /** Playback context handed to the player so next/previous follow this list. */
  queue?: AudioTrack[];
}

/** Tiny equalizer shown on the cover while this track is playing. */
function PlayingBars() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-night"
          animate={{ scaleY: [0.4, 1, 0.4] }}
          style={{ height: "100%", transformOrigin: "bottom" }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </span>
  );
}

export function AudioCard({ track, queue }: AudioCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const isCurrent = usePlayerStore((s) => s.currentTrack?.id === track.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const openDetail = useUiStore((s) => s.openDetail);
  const playing = isCurrent && isPlaying;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-300 hover:border-gold/30 hover:shadow-[0_20px_60px_-20px_rgba(200,169,107,0.3)] focus-within:border-gold/40"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={getThumbnail(track)}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-night/20 transition-opacity duration-300" />

        <Badge className="absolute left-3 top-3 border-gold/25 bg-night/70 text-gold backdrop-blur-md">
          {track.category}
        </Badge>

        <span className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-night/70 px-2.5 py-1 text-xs font-medium text-sand backdrop-blur-md">
          <Clock className="size-3 text-gold/80" aria-hidden="true" />
          {formatDuration(track.duration)}
        </span>

        {/* Play sits above the stretched detail button */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            playTrack(track, queue);
          }}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="absolute bottom-3 right-3 z-10 flex size-11 items-center justify-center rounded-full bg-gold text-night shadow-lg shadow-night/40 transition-all duration-300 hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night sm:translate-y-2 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
          style={
            playing || isCurrent
              ? { opacity: 1, transform: "translateY(0)" }
              : undefined
          }
        >
          {playing ? (
            <span className="relative flex items-center justify-center">
              <span className="transition-opacity duration-200 group-hover:opacity-0">
                <PlayingBars />
              </span>
              <Pause
                className="absolute size-4.5 fill-current opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                aria-hidden="true"
              />
            </span>
          ) : (
            <Play className="ml-0.5 size-4.5 fill-current" aria-hidden="true" />
          )}
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-foreground">
          {/* Stretched button: makes the whole card open the detail drawer
              without nesting interactive elements. */}
          <button
            type="button"
            onClick={() => openDetail(track)}
            lang={getLangCode(track.language)}
            dir="auto"
            className="line-clamp-2 w-full text-left transition-colors after:absolute after:inset-0 after:content-[''] hover:text-gold-bright focus-visible:outline-none focus-visible:text-gold-bright"
          >
            {track.title}
          </button>
        </h3>

        <p className="text-sm text-muted-foreground">{track.speaker}</p>

        <dl className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3 text-gold/70" aria-hidden="true" />
            <dt className="sr-only">Published</dt>
            <dd>{formatDate(track.date)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="size-3 text-gold/70" aria-hidden="true" />
            <dt className="sr-only">Language</dt>
            <dd>{track.language}</dd>
          </div>
        </dl>
      </div>
    </motion.article>
  );
}
