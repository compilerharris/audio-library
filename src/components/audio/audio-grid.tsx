"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";

import { AudioCard } from "@/components/audio/audio-card";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "@/store/library-store";
import type { AudioTrack } from "@/types/audio";

interface AudioGridProps {
  tracks: AudioTrack[];
}

/**
 * Responsive lecture grid: 1 column on mobile, 2 on tablet, 4 on desktop.
 * Cards animate in/out and reflow smoothly as search and filters change.
 */
export function AudioGrid({ tracks }: AudioGridProps) {
  const clearAll = useLibraryStore((s) => s.clearAll);

  if (tracks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-20 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
          <SearchX className="size-7 text-gold" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h3 className="font-display text-xl font-semibold text-foreground">
            No lectures found
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Nothing matches your current search and filters. Try a different
            term or broaden the selection.
          </p>
        </div>
        <Button
          onClick={clearAll}
          className="rounded-full bg-gold px-6 text-night hover:bg-gold-bright"
        >
          Clear search & filters
        </Button>
      </motion.div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {tracks.map((track, index) => (
          <motion.li
            key={track.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.45,
                delay: Math.min(index * 0.05, 0.4),
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.2 },
            }}
          >
            <AudioCard track={track} queue={tracks} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
