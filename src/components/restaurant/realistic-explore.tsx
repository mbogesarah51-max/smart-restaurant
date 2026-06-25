"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, Crown, MapPin, Search, Store, UtensilsCrossed } from "lucide-react";
import { RestaurantCard } from "./restaurant-card";
import type { SearchParams, SearchResult } from "@/app/actions/restaurant";

const cities = ["", "Douala", "Yaoundé", "Limbe", "Buea"];
const priceOptions = [
  { value: "", label: "All budgets", icon: UtensilsCrossed },
  { value: "BUDGET", label: "Small & affordable", icon: Store },
  { value: "MODERATE", label: "Comfortable mid-range", icon: Building2 },
  { value: "PREMIUM", label: "Premium dining", icon: Crown },
  { value: "LUXURY", label: "Classy & luxury", icon: Crown },
];

interface Props {
  initialData: SearchResult;
  initialParams: SearchParams;
}

export function RealisticExplore({ initialData, initialParams }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialParams.query || "");
  const [city, setCity] = useState(initialParams.city || "");
  const [price, setPrice] = useState(initialParams.priceRange?.[0] || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");

  function navigate(page = 1) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    if (price) params.set("price", price);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    startTransition(() => router.push(`/explore?${params.toString()}`));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(1);
  }

  function chooseCity(value: string) {
    setCity(value);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (value) params.set("city", value);
    if (price) params.set("price", price);
    if (sort !== "newest") params.set("sort", sort);
    startTransition(() => router.push(`/explore?${params.toString()}`));
  }

  function choosePrice(value: string) {
    setPrice(value);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    if (value) params.set("price", value);
    if (sort !== "newest") params.set("sort", sort);
    startTransition(() => router.push(`/explore?${params.toString()}`));
  }

  return (
    <div>
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">Cameroon restaurant directory</p>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black tracking-tight sm:text-5xl">
              From neighbourhood chop spots to classy fine dining.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Browse realistic demonstration listings from Douala, Yaoundé, Limbe and Buea. Each listing includes a location, food photographs, menu prices in FCFA and reservation details.
            </p>
          </div>
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-sm font-bold">What can you find here?</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
              <span className="rounded-xl bg-white/5 px-3 py-2">Student-friendly meals</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Family restaurants</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Premium grills</span>
              <span className="rounded-xl bg-white/5 px-3 py-2">Luxury date nights</span>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="sticky top-20 z-20 mt-6 rounded-3xl border border-black/5 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_200px_160px_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl bg-slate-50 px-4 ring-1 ring-slate-100">
            <Search className="size-4 text-orange-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search restaurant or food" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="flex h-12 items-center gap-2 rounded-xl bg-slate-50 px-3 ring-1 ring-slate-100">
            <MapPin className="size-4 text-orange-600" />
            <select value={city} onChange={(event) => chooseCity(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none">
              {cities.map((item) => <option key={item || "all"} value={item}>{item || "All cities"}</option>)}
            </select>
          </label>
          <select value={price} onChange={(event) => choosePrice(event.target.value)} className="h-12 rounded-xl bg-slate-50 px-3 text-sm font-semibold outline-none ring-1 ring-slate-100">
            {priceOptions.map((item) => <option key={item.value || "all"} value={item.value}>{item.label}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value as SearchParams["sort"])} className="h-12 rounded-xl bg-slate-50 px-3 text-sm font-semibold outline-none ring-1 ring-slate-100">
            <option value="newest">Recently added</option>
            <option value="price_asc">Budget first</option>
            <option value="price_desc">Luxury first</option>
          </select>
          <button type="submit" className="h-12 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 text-sm font-black text-white shadow-lg disabled:opacity-60" disabled={pending}>
            {pending ? "Loading..." : "Apply"}
          </button>
        </div>
      </form>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {priceOptions.map((item) => {
          const Icon = item.icon;
          const active = price === item.value;
          return <button key={item.value || "all"} type="button" onClick={() => choosePrice(item.value)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${active ? "bg-orange-600 text-white shadow-md" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-orange-300"}`}><Icon className="size-3.5" />{item.label}</button>;
        })}
      </div>

      <div className="mt-8 flex items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">Available listings</p>
          <h2 className="mt-2 font-heading text-3xl font-black text-slate-950">
            {city ? `Restaurants in ${city}` : "Restaurants across Cameroon"}
          </h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">{initialData.total} restaurant{initialData.total === 1 ? "" : "s"}</p>
      </div>

      {initialData.restaurants.length > 0 ? (
        <div className={`mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 ${pending ? "opacity-50" : ""}`}>
          {initialData.restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} detailBasePath="/restaurants" />)}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl bg-white py-20 text-center ring-1 ring-slate-100">
          <UtensilsCrossed className="mx-auto size-10 text-orange-300" />
          <h3 className="mt-4 font-heading text-xl font-black text-slate-900">No restaurant matches these filters.</h3>
          <p className="mt-2 text-sm text-slate-500">Try another city, budget or food name.</p>
          <button onClick={() => router.push("/explore")} className="mt-5 text-sm font-black text-orange-600">Clear filters</button>
        </div>
      )}

      {initialData.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button disabled={initialData.page <= 1 || pending} onClick={() => navigate(initialData.page - 1)} className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40"><ChevronLeft className="size-4" />Previous</button>
          <span className="text-sm font-semibold text-slate-500">Page {initialData.page} of {initialData.totalPages}</span>
          <button disabled={initialData.page >= initialData.totalPages || pending} onClick={() => navigate(initialData.page + 1)} className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-40">Next<ChevronRight className="size-4" /></button>
        </div>
      )}

      <p className="mt-10 rounded-2xl bg-amber-50 px-5 py-4 text-xs leading-6 text-amber-900 ring-1 ring-amber-100">
        Presentation catalogue: these are realistic demonstration listings created for the ChopWise project. They illustrate how verified restaurants will appear after onboarding; they should not be presented as independently verified real-world businesses.
      </p>
    </div>
  );
}
