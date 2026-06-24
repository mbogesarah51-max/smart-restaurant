import { Navbar } from "@/components/landing/navbar";
import { FeaturedRestaurantsSection } from "@/components/landing/featured-restaurants";
import { getLandingStats } from "@/app/actions/landing";
import {
  HeroSection,
  SocialProofSection,
  FeaturesSection,
  HowItWorksSection,
  AIShowcaseSection,
  ForRestaurantsSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "@/components/landing/foodie-sections";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const stats = await getLandingStats();

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofSection stats={stats} />
      <AIShowcaseSection />
      <FeaturedRestaurantsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForRestaurantsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
