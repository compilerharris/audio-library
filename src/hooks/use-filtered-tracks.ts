"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";

import { filterTracks, tracks } from "@/lib/audio";
import { useLibraryStore } from "@/store/library-store";
import type { AudioTrack } from "@/types/audio";

const fuse = new Fuse<AudioTrack>(tracks, {
  keys: [
    { name: "title", weight: 2 },
    { name: "speaker", weight: 1.5 },
    { name: "description", weight: 1 },
    { name: "category", weight: 1 },
    { name: "language", weight: 0.5 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

/**
 * Fuzzy search (Fuse.js) across title, description, speaker, category and
 * language, combined with the active multi-select filters. Results update
 * instantly as the user types.
 */
export function useFilteredTracks(): AudioTrack[] {
  const query = useLibraryStore((s) => s.query);
  const filters = useLibraryStore((s) => s.filters);

  return useMemo(() => {
    const trimmed = query.trim();
    const searched = trimmed
      ? fuse.search(trimmed).map((result) => result.item)
      : tracks;
    return filterTracks(searched, filters);
  }, [query, filters]);
}
