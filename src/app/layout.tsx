import type { Metadata, Viewport } from "next";
import { Amiri, Inter, Playfair_Display } from "next/font/google";

import { Providers } from "@/app/providers";
import { AudioDetailDrawer } from "@/components/audio/audio-detail-drawer";
import { DonationButton } from "@/components/donation/donation-button";
import { DonationModal } from "@/components/donation/donation-modal";
import { PlayerDock } from "@/components/player/player-dock";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0F0B08",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Noor Audio Library — Timeless Islamic Lectures",
    template: "%s · Noor Audio Library",
  },
  description:
    "A curated library of long-form audio lectures on Qur'an, seerah, fiqh, and the sciences of the heart. Browse, search, and listen for free.",
  keywords: [
    "Islamic lectures",
    "audio library",
    "Qur'an tafsir",
    "seerah",
    "Islamic podcast",
  ],
  openGraph: {
    title: "Noor Audio Library",
    description:
      "Timeless knowledge, beautifully preserved. Stream long-form Islamic lectures for free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${playfair.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-night"
        >
          Skip to content
        </a>
        <Providers>
          {children}
          <AudioDetailDrawer />
          <DonationButton />
          <DonationModal />
          <PlayerDock />
        </Providers>
      </body>
    </html>
  );
}
