import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { PageIntro } from "@/components/landing/page-intro";
import { CompactHowItWorks, WhatsAppFlow } from "@/components/landing/foodie-operations";
import { FoodieFooter } from "@/components/landing/foodie-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works | ChopWise",
  description: "See how diners and restaurant owners use ChopWise from discovery to reservation confirmation.",
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PageIntro
        eyebrow="How ChopWise works"
        title="A clear journey from restaurant search to confirmed table."
        description="Diners discover restaurants, compare food and prices, submit a reservation and follow the response. Restaurant owners receive, review and manage every request from their dashboard."
        image="https://commons.wikimedia.org/wiki/Special:FilePath/Achu_and_Yellow_Soup_with_vegetable.jpg?width=1600"
        actions={<Link href="/explore"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">Start exploring <ArrowRight className="ml-2 size-4" /></Button></Link>}
      />
      <CompactHowItWorks />
      <WhatsAppFlow />
      <FoodieFooter />
    </main>
  );
}
