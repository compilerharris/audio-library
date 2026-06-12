"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HandHeart } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/player-store";
import { useUiStore } from "@/store/ui-store";

/**
 * Floating donation button, fixed bottom-right. Slides up when the
 * mini player is docked so it never overlaps the controls.
 */
export function DonationButton() {
  const setDonationOpen = useUiStore((s) => s.setDonationOpen);
  const playerVisible = usePlayerStore((s) => s.currentTrack !== null);
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "fixed right-5 z-40 transition-[bottom] duration-300 lg:right-8",
        playerVisible
          ? "bottom-36 sm:bottom-26 lg:bottom-28"
          : "bottom-[max(1.5rem,env(safe-area-inset-bottom))] lg:bottom-8"
      )}
    >
      {/* Soft pulsing halo to draw the eye without being intrusive */}
      {!reducedMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gold/40"
          animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.button
        type="button"
        onClick={() => setDonationOpen(true)}
        aria-label="Open donation details"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="group relative flex h-13 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-br from-gold-bright to-bronze pl-3.5 pr-4 text-night shadow-xl shadow-gold/30 transition-shadow hover:shadow-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <HandHeart className="size-5.5" aria-hidden="true" />
        <span className="max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-[max-width] duration-300 group-hover:max-w-24 group-focus-visible:max-w-24 sm:max-w-24">
          Donate
        </span>
      </motion.button>
    </motion.div>
  );
}
