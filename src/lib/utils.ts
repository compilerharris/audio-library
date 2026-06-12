import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Smooth-scrolls to an element, falling back to instant for reduced motion. */
export function scrollToId(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  element.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}
