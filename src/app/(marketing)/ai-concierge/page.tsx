import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { PageIntro } from "@/components/landing/page-intro";
import { AIProductDemo } from "@/components/landing/ai-live-demo";
import { FoodieCTA, FoodieFooter } from "@/components/landing/foodie-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "AI Concierge | ChopWise",
  description: "Use ChopWise AI to find restaurants by budget, city, cuisine and occasion.",
};

export default function AIConciergePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PageIntro
        eyebrow="AI restaurant concierge"
        title="Ask naturally. Receive restaurant matches that fit the moment."
        description="Tell ChopWise your city, budget, cravings, group size or occasion. The recommendation engine checks approved restaurants and available menu data before presenting ranked matches."
        image="https://commons.wikimedia.org/wiki/Special:FilePath/Banane_plantains_brais%C3%A9s_accompagn%C3%A9s_de_prunes.jpg?width=1600"
        actions={<Link href="/ai-concierge/chat"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">Open ChopWise AI <ArrowRight className="ml-2 size-4" /></Button></Link>}
      />
      <AIProductDemo />
      <section className="bg-[#fffaf5] py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            [Sparkles, "Understands intent", "The assistant can interpret requests such as date night, family outing, business lunch or traditional food."],
            [Bot, "Uses platform data", "Recommendations are matched against approved restaurants, menu prices, cities and amenities stored in ChopWise."],
            [ShieldCheck, "Reduces hallucinations", "Unknown restaurant IDs are rejected before the results are shown to the diner."],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Sparkles;
            return <article key={String(title)} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5"><ItemIcon className="size-7 text-orange-600" /><h2 className="mt-5 font-heading text-xl font-black text-slate-950">{String(title)}</h2><p className="mt-3 text-sm leading-7 text-slate-500">{String(text)}</p></article>;
          })}
        </div>
      </section>
      <FoodieCTA />
      <FoodieFooter />
    </main>
  );
}
