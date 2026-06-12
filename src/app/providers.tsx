"use client";

import { MotionConfig } from "framer-motion";

/**
 * Disables Framer Motion transform/layout animations app-wide for users
 * with prefers-reduced-motion, on top of per-component opt-outs.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
