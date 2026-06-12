"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FilterX, X } from "lucide-react";

import { MultiSelectFilter } from "@/components/filters/multi-select-filter";
import { Button } from "@/components/ui/button";
import { DURATION_BUCKETS, getFacets } from "@/lib/audio";
import { hasActiveRefinements, useLibraryStore } from "@/store/library-store";
import type { LibraryFilters } from "@/types/audio";

const GROUPS: { key: keyof LibraryFilters; label: string }[] = [
  { key: "categories", label: "Category" },
  { key: "speakers", label: "Speaker" },
  { key: "languages", label: "Language" },
  { key: "years", label: "Date" },
  { key: "durations", label: "Duration" },
];

const durationLabel = (value: string) =>
  DURATION_BUCKETS.find((b) => b.value === value)?.label ?? value;

export function FilterBar() {
  const filters = useLibraryStore((s) => s.filters);
  const query = useLibraryStore((s) => s.query);
  const toggleFilter = useLibraryStore((s) => s.toggleFilter);
  const clearGroup = useLibraryStore((s) => s.clearGroup);
  const clearAll = useLibraryStore((s) => s.clearAll);

  const facets = useMemo(() => getFacets(), []);

  const chips = GROUPS.flatMap(({ key }) =>
    filters[key].map((value) => ({
      group: key,
      value,
      label: key === "durations" ? durationLabel(value) : value,
    }))
  );

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Filter the audio library"
        className="flex flex-wrap items-center gap-2.5"
      >
        {GROUPS.map(({ key, label }) => (
          <MultiSelectFilter
            key={key}
            label={label}
            options={facets[key]}
            selected={filters[key]}
            onToggle={(value) => toggleFilter(key, value)}
            onClear={() => clearGroup(key)}
          />
        ))}

        {hasActiveRefinements({ query, filters }) && (
          <Button
            variant="ghost"
            onClick={clearAll}
            className="h-10 gap-2 rounded-full px-4 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <FilterX className="size-4" aria-hidden="true" />
            Clear all
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.ul
            aria-label="Active filters"
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AnimatePresence initial={false}>
              {chips.map((chip) => (
                <motion.li
                  key={`${chip.group}-${chip.value}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.18 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFilter(chip.group, chip.value)}
                    aria-label={`Remove filter ${chip.label}`}
                    className="group flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 py-1 pl-3 pr-2 text-xs font-medium text-sand transition-colors hover:border-gold/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  >
                    {chip.label}
                    <X
                      className="size-3 text-gold/70 transition-colors group-hover:text-gold"
                      aria-hidden="true"
                    />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
