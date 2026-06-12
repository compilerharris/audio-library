"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useLibraryStore } from "@/store/library-store";

/**
 * Instant fuzzy search box. Supports the "/" keyboard shortcut to focus,
 * matching the behavior of premium media libraries.
 */
export function SearchBar() {
  const query = useLibraryStore((s) => s.query);
  const setQuery = useLibraryStore((s) => s.setQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="relative w-full"
    >
      <Search
        className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-gold/70"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search lectures, speakers, topics…"
        aria-label="Search the audio library"
        className="h-14 rounded-full border-gold/20 bg-surface/80 pl-13 pr-24 text-base text-foreground shadow-[0_8px_40px_-12px_rgba(200,169,107,0.15)] backdrop-blur-sm placeholder:text-muted-foreground/70 focus-visible:border-gold/50 focus-visible:ring-gold/20 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gold/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        <kbd
          aria-hidden="true"
          className="hidden rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground sm:block"
        >
          /
        </kbd>
      </div>
    </form>
  );
}
