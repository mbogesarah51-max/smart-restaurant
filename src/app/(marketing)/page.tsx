import { Navbar } from "@/components/landing/navbar";
import { FoodieHero } from "@/components/landing/foodie-hero";
import { AIProductDemo, FeaturedFoodSection, LocalTrustBar } from "@/components/landing/foodie-discovery";
import { CoreFeatures } from "@/components/landing/foodie-operations";
import { FoodieFooter } from "@/components/landing/foodie-footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <FoodieHero />
      <LocalTrustBar />
      <FeaturedFoodSection />
      <AIProductDemo />
      <CoreFeatures />
      <FoodieFooter />
    </main>
  );
}
