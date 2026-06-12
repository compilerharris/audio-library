"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Headphones, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeaturedCard } from "@/components/hero/featured-card";
import { GeometricPattern } from "@/components/hero/geometric-pattern";
import { ScrollIndicator } from "@/components/hero/scroll-indicator";
import { scrollToId } from "@/lib/utils";
import { usePlayerStore } from "@/store/player-store";
import type { AudioTrack, LibraryStats } from "@/types/audio";

interface HeroSectionProps {
  featured: AudioTrack;
  stats: LibraryStats;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroSection({ featured, stats }: HeroSectionProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const reducedMotion = useReducedMotion();

  const scrollToLibrary = () => scrollToId("library");

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-night via-[#161009] to-night" />

        {/* Slow-drifting golden glow orbs */}
        <motion.div
          className="absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]"
          animate={
            reducedMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-bronze/10 blur-[110px]"
          animate={reducedMotion ? undefined : { x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[-6rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-gold-bright/[0.07] blur-[100px]"
          animate={reducedMotion ? undefined : { x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Geometric pattern, faded toward the edges */}
        <GeometricPattern
          id="hero-pattern"
          className="absolute inset-0 h-full w-full text-gold/[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        />

        {/* Fade into the page below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-1 items-center px-6 pb-28 pt-24 lg:px-10">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_minmax(0,28rem)] lg:gap-20">
          {/* Editorial copy */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              className="font-arabic text-2xl leading-relaxed text-gold/80"
              lang="ar"
              dir="rtl"
            >
              العِلْمُ نُورٌ
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-5 flex items-center gap-4"
            >
              <span className="h-px w-12 bg-gold/60" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gold">
                Noor Audio Library
              </p>
            </motion.div>

            <motion.h1
              id="hero-heading"
              variants={fadeUp}
              className="mt-6 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Timeless knowledge,
              <br />
              <span className="text-gradient-gold">beautifully preserved.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              A curated library of long-form lectures on Qur&apos;an, seerah,
              and the sciences of the heart — recorded by beloved teachers and
              free to stream, anywhere.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => playTrack(featured)}
                className="h-12 gap-2.5 rounded-full bg-gold px-7 text-sm font-semibold text-night shadow-lg shadow-gold/25 hover:bg-gold-bright"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                Start Listening
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToLibrary}
                className="h-12 gap-2.5 rounded-full border-gold/30 bg-transparent px-7 text-sm font-medium text-sand hover:border-gold/60 hover:bg-gold/10 hover:text-foreground"
              >
                <Headphones className="size-4" aria-hidden="true" />
                Browse Library
              </Button>
            </motion.div>

            <motion.dl
              variants={fadeUp}
              className="mt-12 flex items-center gap-8 sm:gap-12"
            >
              {[
                { value: `${stats.lectures}+`, label: "Lectures" },
                { value: `${stats.speakers}`, label: "Speakers" },
                { value: `${stats.hours}+`, label: "Hours" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dd className="font-display text-3xl font-semibold text-gold">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Featured lecture */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md lg:justify-self-end"
          >
            <FeaturedCard track={featured} />
          </motion.div>
        </div>
      </div>

      <ScrollIndicator targetId="library" />
    </section>
  );
}
