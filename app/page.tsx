import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ProblemSection } from "@/components/problem-section";
import { RevealSection } from "@/components/reveal-section";
import { FeaturesSection } from "@/components/features-section";
import { SearchSection } from "@/components/search-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { ImpactSection } from "@/components/impact-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <RevealSection />
        <FeaturesSection />
        <SearchSection />
        <HowItWorksSection />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
}
