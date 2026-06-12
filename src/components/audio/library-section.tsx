"use client";

import { motion } from "framer-motion";

import { AudioGrid } from "@/components/audio/audio-grid";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchBar } from "@/components/filters/search-bar";
import { useFilteredTracks } from "@/hooks/use-filtered-tracks";
import { tracks } from "@/lib/audio";

/**
 * The library: search, filters and (next) the responsive lecture grid.
 * Anchored at #library so the hero CTA and scroll indicator land here.
 */
export function LibrarySection() {
  const results = useFilteredTracks();

  return (
    <section
      id="library"
      aria-labelledby="library-heading"
      className="relative scroll-mt-8 py-20 lg:py-28"
    >
      <div className="container mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            The Library
          </p>
          <h2
            id="library-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Browse the collection
          </h2>
          <p className="mt-4 text-muted-foreground">
            Search by title, speaker or topic — or refine by category,
            language, date and length.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <FilterBar />
        </motion.div>

        <p
          role="status"
          aria-live="polite"
          className="mt-8 text-sm text-muted-foreground"
        >
          Showing{" "}
          <span className="font-semibold text-gold">{results.length}</span> of{" "}
          {tracks.length} lectures
        </p>

        <div className="mt-6">
          <AudioGrid tracks={results} />
        </div>
      </div>
    </section>
  );
}
