/** A single audio lecture in the library. */
export interface AudioTrack {
  id: number;
  title: string;
  description: string;
  speaker: string;
  language: string;
  category: string;
  /** ISO date string, e.g. "2025-11-08" */
  date: string;
  /** Duration in seconds. Lectures may exceed one hour. */
  duration: number;
  /** Optional cover image URL. Empty string falls back to a premium placeholder. */
  thumbnail: string;
  /** Direct-download Google Drive URL: https://drive.google.com/uc?export=download&id=FILE_ID */
  audioUrl: string;
}

/** Duration filter buckets used across the filter UI. */
export type DurationBucket = "under-15" | "15-30" | "30-60" | "over-60";

/** Active multi-select filter values. Empty arrays mean "no restriction". */
export interface LibraryFilters {
  categories: string[];
  speakers: string[];
  languages: string[];
  years: string[];
  durations: DurationBucket[];
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface LibraryStats {
  lectures: number;
  speakers: number;
  hours: number;
}
