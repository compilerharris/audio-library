"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { scrollToId } from "@/lib/utils";

interface ScrollIndicatorProps {
  targetId?: string;
}

export function ScrollIndicator({ targetId = "library" }: ScrollIndicatorProps) {
  return (
    <motion.button
      type="button"
      onClick={() => scrollToId(targetId)}
      aria-label="Scroll down to the audio library"
      className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-gold focus-visible:text-gold focus-visible:outline-none sm:flex"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.8 }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.35em]">
        Explore
      </span>
      <span className="flex h-9 w-[22px] items-start justify-center rounded-full border border-muted-foreground/40 p-1.5">
        <motion.span
          className="h-2 w-[3px] rounded-full bg-gold"
          animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <ChevronDown className="size-4" aria-hidden="true" />
    </motion.button>
  );
}
