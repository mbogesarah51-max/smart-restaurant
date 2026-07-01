import Link from "next/link";
import { ArrowRight, BarChart3, ImagePlus, MessageCircle, Settings2 } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { PageIntro } from "@/components/landing/page-intro";
import { RestaurantOwnerSection } from "@/components/landing/foodie-operations";
import { FoodieFooter } from "@/components/landing/foodie-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "For Restaurants | ChopWise",
  description: "Create a restaurant profile, manage menus, receive reservations and grow visibility with ChopWise.",
};

export default function ForRestaurantsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <PageIntro
        eyebrow="For restaurant owners"
        title="Put your food, location and availability in front of diners who are ready to book."
        description="ChopWise gives restaurant owners a structured digital profile, menu management, reservation control and WhatsApp-ready communication from one dashboard."
        image="https://commons.wikimedia.org/wiki/Special:FilePath/Grillades_de_poisson.jpg?width=1600"
        actions={<Link href="/sign-up/owner"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">List your restaurant <ArrowRight className="ml-2 size-4" /></Button></Link>}
      />
      <RestaurantOwnerSection />
      <section className="bg-[#fffaf5] py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            [Settings2, "Create your profile", "Add your restaurant name, city, location, opening hours, amenities and contact information."],
            [ImagePlus, "Show food visually", "Upload banner, gallery and menu photographs that help diners choose with confidence."],
            [MessageCircle, "Manage reservations", "Accept, reject and follow reservation status changes from the owner dashboard."],
            [BarChart3, "Grow visibility", "Appear in city and budget searches and become eligible for AI recommendations."],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Settings2;
            return <article key={String(title)} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5"><ItemIcon className="size-7 text-orange-600" /><h2 className="mt-5 font-heading text-xl font-black text-slate-950">{String(title)}</h2><p className="mt-3 text-sm leading-7 text-slate-500">{String(text)}</p></article>;
          })}
        </div>
      </section>
      <FoodieFooter />
    </main>
  );
}
