import { LibrarySection } from "@/components/audio/library-section";
import { HeroSection } from "@/components/hero/hero-section";
import { getFeaturedTrack, getLibraryStats } from "@/lib/audio";

export default function Home() {
  const featured = getFeaturedTrack();
  const stats = getLibraryStats();

  return (
    <main id="main" className="flex-1">
      <HeroSection featured={featured} stats={stats} />
      <LibrarySection />
    </main>
  );
}
