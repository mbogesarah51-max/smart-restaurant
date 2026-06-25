import { Navbar } from "@/components/landing/navbar";
import { FoodieHero } from "@/components/landing/foodie-hero";
import { AIProductDemo, FeaturedFoodSection, LocalTrustBar } from "@/components/landing/foodie-discovery";
import {
  CompactHowItWorks,
  CoreFeatures,
  HonestProofSection,
  RestaurantOwnerSection,
  WhatsAppFlow,
} from "@/components/landing/foodie-operations";
import { FoodieCTA, FoodieFooter } from "@/components/landing/foodie-footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <FoodieHero />
      <LocalTrustBar />
      <FeaturedFoodSection />
      <AIProductDemo />
      <CoreFeatures />
      <CompactHowItWorks />
      <WhatsAppFlow />
      <RestaurantOwnerSection />
      <HonestProofSection />
      <FoodieCTA />
      <FoodieFooter />
    </main>
  );
}
