import { Navbar } from "@/components/landing/navbar";
import {
  HeroSection,
  SocialProofSection,
  FeaturesSection,
  HowItWorksSection,
  AIShowcaseSection,
  ForRestaurantsSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "@/components/landing/sections";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AIShowcaseSection />
      <ForRestaurantsSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
