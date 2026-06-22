import audioData from "@/data/audio.json";
import type {
  AudioTrack,
  DurationBucket,
  FacetOption,
  LibraryFilters,
  LibraryStats,
} from "@/types/audio";

export const tracks: AudioTrack[] = audioData;

const COVER_COUNT = 6;

/** Returns the track thumbnail, falling back to a premium generated cover. */
export function getThumbnail(track: AudioTrack): string {
  return track.thumbnail || `/covers/cover-${(track.id % COVER_COUNT) + 1}.svg`;
}

/**
 * Pulls the Google Drive file id out of any of the common URL shapes:
 *  - https://drive.google.com/uc?export=download&id=FILE_ID
 *  - https://drive.google.com/file/d/FILE_ID/view
 *  - a bare FILE_ID
 * Returns null for non-Drive URLs (e.g. a CDN/S3 link), so they pass through.
 */
export function extractDriveId(audioUrl: string): string | null {
  if (!audioUrl) return null;
  const byQuery = audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (byQuery) return byQuery[1];
  const byPath = audioUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (byPath) return byPath[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(audioUrl)) return audioUrl;
  return null;
}

/**
 * The URL the audio element should load. Drive files go through our
 * streaming proxy (range support, scan-page bypass); any other URL is
 * used as-is so the app also works with a CDN or static host later.
 */
export function getStreamUrl(track: AudioTrack): string {
  const id = extractDriveId(track.audioUrl);
  return id ? `/api/audio/${id}` : track.audioUrl;
}

/** Human-readable duration, e.g. "1 hr 23 min" or "45 min". */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${Math.max(minutes, 1)} min`;
}

/** Clock-style time, e.g. "1:23:45" or "45:09". */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
}

const LANGUAGE_CODES: Record<string, string> = {
  english: "en",
  arabic: "ar",
  urdu: "ur",
};

/**
 * BCP 47 code for a track's language, so Arabic/Urdu titles get correct
 * lang attributes (screen reader pronunciation) and RTL shaping.
 */
export function getLangCode(language: string): string | undefined {
  return LANGUAGE_CODES[language.toLowerCase()];
}

/** Editorial date, e.g. "Apr 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** The most recently published lecture is featured in the hero. */
export function getFeaturedTrack(): AudioTrack {
  return tracks.reduce((latest, track) =>
    track.date > latest.date ? track : latest
  );
}

export function getLibraryStats(): LibraryStats {
  const speakers = new Set(tracks.map((t) => t.speaker)).size;
  const totalSeconds = tracks.reduce((sum, t) => sum + t.duration, 0);
  return {
    lectures: tracks.length,
    speakers,
    hours: Math.round(totalSeconds / 3600),
  };
}

/**
 * Related lectures for the detail drawer: ranked by shared speaker,
 * category and language, topped up with recent lectures if needed.
 */
export function getRelatedTracks(track: AudioTrack, limit = 4): AudioTrack[] {
  const scored = tracks
    .filter((t) => t.id !== track.id)
    .map((t) => {
      let score = 0;
      if (t.speaker === track.speaker) score += 2;
      if (t.category === track.category) score += 2;
      if (t.language === track.language) score += 1;
      return { track: t, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score || b.track.date.localeCompare(a.track.date)
    );
  return scored.slice(0, limit).map((s) => s.track);
}

/* ------------------------------ Filtering ------------------------------ */

export const DURATION_BUCKETS: { value: DurationBucket; label: string }[] = [
  { value: "under-15", label: "Under 15 min" },
  { value: "15-30", label: "15–30 min" },
  { value: "30-60", label: "30–60 min" },
  { value: "over-60", label: "60+ min" },
];

export function getDurationBucket(seconds: number): DurationBucket {
  if (seconds < 15 * 60) return "under-15";
  if (seconds < 30 * 60) return "15-30";
  if (seconds <= 60 * 60) return "30-60";
  return "over-60";
}

export const EMPTY_FILTERS: LibraryFilters = {
  categories: [],
  speakers: [],
  languages: [],
  years: [],
  durations: [],
};

function buildFacet(values: string[]): FacetOption[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));
}

/** Unique filterable values derived from the library, with counts. */
export function getFacets() {
  return {
    categories: buildFacet(tracks.map((t) => t.category)),
    speakers: buildFacet(tracks.map((t) => t.speaker)),
    languages: buildFacet(tracks.map((t) => t.language)),
    years: buildFacet(tracks.map((t) => t.date.slice(0, 4))).sort((a, b) =>
      b.value.localeCompare(a.value)
    ),
    durations: DURATION_BUCKETS.map((bucket) => ({
      value: bucket.value,
      label: bucket.label,
      count: tracks.filter((t) => getDurationBucket(t.duration) === bucket.value)
        .length,
    })),
  };
}

export type LibraryFacets = ReturnType<typeof getFacets>;

/** Applies all active multi-select filters. Empty selections pass everything. */
export function filterTracks(
  list: AudioTrack[],
  filters: LibraryFilters
): AudioTrack[] {
  return list.filter((track) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(track.category)
    ) {
      return false;
    }
    if (
      filters.speakers.length > 0 &&
      !filters.speakers.includes(track.speaker)
    ) {
      return false;
    }
    if (
      filters.languages.length > 0 &&
      !filters.languages.includes(track.language)
    ) {
      return false;
    }
    if (
      filters.years.length > 0 &&
      !filters.years.includes(track.date.slice(0, 4))
    ) {
      return false;
    }
    if (
      filters.durations.length > 0 &&
      !filters.durations.includes(getDurationBucket(track.duration))
    ) {
      return false;
    }
    return true;
  });
}
