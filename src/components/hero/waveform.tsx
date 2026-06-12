"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface WaveformProps {
  playing?: boolean;
  bars?: number;
  className?: string;
}

/**
 * Animated audio waveform. Bar heights are derived deterministically
 * from the index (not Math.random) to keep SSR and client renders identical.
 */
export function Waveform({ playing = false, bars = 28, className }: WaveformProps) {
  const reducedMotion = useReducedMotion();
  const animate = playing && !reducedMotion;

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-10 items-end gap-[3px]", className)}
    >
      {Array.from({ length: bars }, (_, i) => {
        const height = 0.25 + Math.abs(Math.sin(i * 2.4 + 1.3)) * 0.75;
        const dip = 0.35 + ((i * 7) % 10) / 25;
        return (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-bronze via-gold to-gold-bright"
            style={{ height: `${height * 100}%`, transformOrigin: "bottom" }}
            animate={animate ? { scaleY: [1, dip, 1] } : { scaleY: 1 }}
            transition={
              animate
                ? {
                    duration: 0.7 + ((i * 13) % 8) / 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: (i % 6) * 0.09,
                  }
                : { duration: 0.25 }
            }
          />
        );
      })}
    </div>
  );
}
