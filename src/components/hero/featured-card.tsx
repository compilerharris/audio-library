"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Globe, Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Waveform } from "@/components/hero/waveform";
import {
  formatDate,
  formatDuration,
  getLangCode,
  getThumbnail,
} from "@/lib/audio";
import { usePlayerStore } from "@/store/player-store";
import type { AudioTrack } from "@/types/audio";

interface FeaturedCardProps {
  track: AudioTrack;
}

export function FeaturedCard({ track }: FeaturedCardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const isCurrent = usePlayerStore((s) => s.currentTrack?.id === track.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playing = isCurrent && isPlaying;

  return (
    <motion.article
      aria-label={`Featured lecture: ${track.title}`}
      className="group relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/15 bg-surface/80 shadow-[0_24px_80px_-24px_rgba(200,169,107,0.25)] backdrop-blur-sm"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={getThumbnail(track)}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 28rem"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />

        <Badge className="absolute left-4 top-4 border-gold/30 bg-night/70 text-gold backdrop-blur-md">
          Featured
        </Badge>

        <motion.button
          type="button"
          onClick={() => playTrack(track)}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className="absolute bottom-4 right-4 flex size-14 items-center justify-center rounded-full bg-gold text-night shadow-lg shadow-gold/30 transition-colors hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
        >
          {playing ? (
            <Pause className="size-6 fill-current" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 size-6 fill-current" aria-hidden="true" />
          )}
        </motion.button>
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            {track.category}
          </p>
          <h3
            lang={getLangCode(track.language)}
            dir="auto"
            className="font-display text-xl font-semibold leading-snug text-foreground"
          >
            {track.title}
          </h3>
          <p className="text-sm text-muted-foreground">{track.speaker}</p>
        </div>

        <Waveform playing={playing} className="h-8" />

        <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-gold/70" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd>{formatDuration(track.duration)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-gold/70" aria-hidden="true" />
            <dt className="sr-only">Published</dt>
            <dd>{formatDate(track.date)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="size-3.5 text-gold/70" aria-hidden="true" />
            <dt className="sr-only">Language</dt>
            <dd>{track.language}</dd>
          </div>
        </dl>
      </div>
    </motion.article>
  );
}
