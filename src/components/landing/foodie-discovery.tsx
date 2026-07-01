import Link from "next/link";
import { ArrowRight, Bot, MapPin, MessageCircle, Star, WalletCards } from "lucide-react";

const experiences = [
  { title: "Brochettes & grilled favourites", city: "Douala", price: "From 5,000 FCFA", rating: "4.8", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brochettes_de_crevettes.jpg?width=900" },
  { title: "Achu & yellow soup", city: "Yaoundé", price: "From 4,500 FCFA", rating: "4.7", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Achu_and_Yellow_Soup_with_vegetable.jpg?width=900" },
  { title: "Fresh grilled fish", city: "Limbe", price: "From 6,500 FCFA", rating: "4.9", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Grillades_de_poisson.jpg?width=900" },
  { title: "Fufu & Eru", city: "Buea", price: "From 3,000 FCFA", rating: "4.6", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fufu_and_Eru.jpg?width=900" },
];

export function LocalTrustBar() {
  const items = [
    [MapPin, "Cameroon cities", "Douala, Yaoundé, Buea and Limbe"],
    [WalletCards, "FCFA-first", "Recommendations that respect local budgets"],
    [MessageCircle, "+237 WhatsApp-ready", "Local number formatting is supported"],
    [Bot, "AI matching", "Budget, mood, cuisine and occasion"],
  ] as const;

  return (
    <section className="border-b border-black/5 bg-[#fffaf5] py-8">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map(([Icon, title, text]) => (
          <div key={title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Icon className="size-5" /></div>
            <div><p className="font-bold text-slate-900">{title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeaturedFoodSection() {
  return (
    <section id="featured" className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Food worth leaving home for</p><h2 className="mt-3 font-heading text-3xl font-black text-slate-950 sm:text-4xl">Explore dining experiences across Cameroon</h2></div>
          <Link href="/explore" className="inline-flex items-center gap-2 font-bold text-orange-600">View restaurants <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {experiences.map((item) => (
            <Link key={item.title} href={`/explore?city=${encodeURIComponent(item.city)}`} className="group overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/10 ring-1 ring-black/5 transition hover:-translate-y-1">
              <div className="relative aspect-[4/3] overflow-hidden"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold"><Star className="size-3 fill-amber-400 text-amber-400" />{item.rating}</span></div>
              <div className="p-5"><h3 className="font-heading text-lg font-black text-slate-950">{item.title}</h3><div className="mt-4 flex items-center justify-between text-xs font-semibold"><span className="flex items-center gap-1 text-slate-500"><MapPin className="size-3.5" />{item.city}</span><span className="text-orange-600">{item.price}</span></div></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// AIProductDemo now lives in ./ai-live-demo.tsx (interactive, public, no sign-in).
