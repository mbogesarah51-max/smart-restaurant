import Link from "next/link";
import { ArrowRight, Bot, MapPin, MessageCircle, Sparkles, Star, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

const experiences = [
  { title: "Grills and local favourites", city: "Douala", price: "From 5,000 FCFA", rating: "4.8", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85" },
  { title: "Elegant dining experiences", city: "Yaoundé", price: "From 8,000 FCFA", rating: "4.7", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85" },
  { title: "Fresh coastal flavours", city: "Limbe", price: "From 6,500 FCFA", rating: "4.9", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=85" },
  { title: "Dessert and coffee spots", city: "Buea", price: "From 3,000 FCFA", rating: "4.6", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85" },
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

export function AIProductDemo() {
  const results = [
    { name: "Warm interior dining", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85", price: "7,500 FCFA", score: "96%" },
    { name: "Fresh chef selection", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85", price: "6,000 FCFA", score: "92%" },
  ];

  return (
    <section id="ai" className="bg-slate-950 py-16 text-white lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 px-4 py-2 text-sm font-bold text-orange-300"><Sparkles className="size-4" />ChopWise AI concierge</div>
          <h2 className="mt-6 font-heading text-4xl font-black sm:text-5xl">Describe the moment. We find the table.</h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">The AI considers budget, city, cuisine and occasion, then recommends only approved restaurants from the database.</p>
          <div className="mt-7 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10"><p className="text-sm leading-7 text-slate-200">“I need a quiet restaurant in Douala for two people. My budget is 15,000 FCFA.”</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{["15,000 FCFA", "Quiet ambience", "Douala"].map((item) => <span key={item} className="rounded-xl bg-slate-900 px-3 py-2 text-center text-xs font-bold text-orange-300">{item}</span>)}</div></div>
          <Link href="/dashboard/ai-recommend" className="mt-7 inline-flex"><Button className="h-12 rounded-xl bg-orange-600 px-6 font-bold text-white">Try AI recommendations <ArrowRight className="ml-2 size-4" /></Button></Link>
        </div>
        <div className="rounded-[2rem] bg-white p-5 text-slate-900 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Example result</p><h3 className="mt-2 font-heading text-2xl font-black">Best matches for your request</h3>
          <div className="mt-5 space-y-4">{results.map((item) => <div key={item.name} className="grid grid-cols-[100px_1fr] gap-4 rounded-2xl border p-3"><img src={item.image} alt={item.name} className="h-24 w-full rounded-xl object-cover" /><div><div className="flex justify-between gap-2"><h4 className="font-heading text-lg font-black">{item.name}</h4><span className="h-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{item.score} match</span></div><p className="mt-3 text-sm font-bold text-orange-600">Estimated {item.price} per person</p></div></div>)}</div>
        </div>
      </div>
    </section>
  );
}
