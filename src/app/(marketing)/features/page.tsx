import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { PageIntro } from "@/components/landing/page-intro";
import { FeaturedFoodSection, LocalTrustBar } from "@/components/landing/foodie-discovery";
import { CoreFeatures, HonestProofSection } from "@/components/landing/foodie-operations";
import { FoodieCTA, FoodieFooter } from "@/components/landing/foodie-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Features | ChopWise",
  description: "Explore the restaurant discovery, AI, reservation and WhatsApp features of ChopWise.",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PageIntro
        eyebrow="ChopWise features"
        title="Everything needed to discover, compare and reserve restaurants in Cameroon."
        description="ChopWise combines food-rich restaurant profiles, city and budget filters, AI recommendations, reservations and WhatsApp communication in one clear experience."
        image="https://commons.wikimedia.org/wiki/Special:FilePath/Bar_aux_l%C3%A9gumes_et_son_riz_gras.jpg?width=1600"
        actions={<Link href="/explore"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">Explore restaurants <ArrowRight className="ml-2 size-4" /></Button></Link>}
      />
      <LocalTrustBar />
      <CoreFeatures />
      <FeaturedFoodSection />
      <HonestProofSection />
      <FoodieCTA />
      <FoodieFooter />
    </main>
  );
}
