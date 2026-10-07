import { HeroSection } from "@/components/hero-section";
import { ProblemSection } from "@/components/problem-section";
import { RevealSection } from "@/components/reveal-section";
import { FeaturesSection } from "@/components/features-section";
import { SearchSection } from "@/components/search-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { ImpactSection } from "@/components/impact-section";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <ProblemSection />
      <RevealSection />
      <FeaturesSection />
      <SearchSection />
      <HowItWorksSection />
      <ImpactSection />
    </div>
  );
}
