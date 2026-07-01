"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = ["Douala", "Yaoundé", "Buea", "Limbe", "Bamenda"];

export function FoodieHero() {
  const router = useRouter();
  const [city, setCity] = useState("Douala");
  const [search, setSearch] = useState("");

  function goToExplore(query: string) {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explore?${params.toString()}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToExplore(search);
  }

  return (
    <section className="relative min-h-[760px] overflow-hidden pt-20 text-white">
      <img
        src="https://commons.wikimedia.org/wiki/Special:FilePath/Bar_aux_l%C3%A9gumes_et_son_riz_gras.jpg?width=1800"
        alt="Braised fish with vegetables and riz gras, a Cameroonian dish"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/20" />
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="size-4 text-amber-300" /> Cameroon&apos;s AI-powered dining guide
          </div>
          <h1 className="mt-6 font-heading text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Great food should be easy to find.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Discover restaurants by city, budget and occasion. Reserve a table and receive clear updates without calling several restaurants.
          </p>

          <form onSubmit={submit} className="mt-9 grid gap-3 rounded-3xl border border-white/15 bg-white/95 p-3 text-slate-900 shadow-2xl md:grid-cols-[1fr_180px_auto]">
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4">
              <Search className="size-5 text-orange-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cuisine, mood or restaurant" className="h-14 w-full bg-transparent text-sm outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4">
              <MapPin className="size-5 text-orange-500" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className="h-14 w-full bg-transparent text-sm font-semibold outline-none">
                {cities.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <Button type="submit" className="h-14 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-7 text-base font-bold text-white">
              Find food <ArrowRight className="ml-2 size-4" />
            </Button>
          </form>

          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            {["Traditional food", "Family outing", "Business lunch", "Under 5,000 FCFA"].map((item) => (
              <button
                key={item}
                onClick={() => goToExplore(item)}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md hover:bg-white/20"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
