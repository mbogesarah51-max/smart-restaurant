"use client";

import Link from "next/link";
import Image from "next/image";
import { Car, MapPin, Star, TreePine, UtensilsCrossed, Wifi, Wind } from "lucide-react";
import type { Restaurant } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";

const PRICE_LABELS: Record<string, { label: string; range: string }> = {
  BUDGET: { label: "Budget-friendly", range: "2,000–5,000 FCFA" },
  MODERATE: { label: "Mid-range", range: "5,000–10,000 FCFA" },
  PREMIUM: { label: "Premium", range: "10,000–20,000 FCFA" },
  LUXURY: { label: "Luxury", range: "20,000+ FCFA" },
};

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  Parking: Car,
  "Air Conditioning": Wind,
  "Outdoor Seating": TreePine,
};

interface MenuPreviewItem {
  id: string;
  name?: string;
  price?: number;
  image?: string | null;
}

interface RestaurantCardProps {
  restaurant: Restaurant & { menuItems: MenuPreviewItem[] };
  detailBasePath?: string;
}

export function RestaurantCard({ restaurant, detailBasePath = "/dashboard/restaurants" }: RestaurantCardProps) {
  const price = PRICE_LABELS[restaurant.priceRange] || PRICE_LABELS.MODERATE;
  const amenities = restaurant.amenities.slice(0, 3);
  const extraCount = Math.max(restaurant.amenities.length - 3, 0);
  const pricedItems = restaurant.menuItems.filter((item) => typeof item.price === "number");
  const startingPrice = pricedItems.length > 0 ? Math.min(...pricedItems.map((item) => item.price as number)) : null;
  const signatureDish = pricedItems[0];

  return (
    <Link href={`${detailBasePath}/${restaurant.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_24px_55px_-24px_rgba(249,115,22,0.42)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-50">
          {restaurant.bannerImage ? (
            <Image
              src={restaurant.bannerImage}
              alt={`${restaurant.name} restaurant and food`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><UtensilsCrossed className="size-10 text-orange-300" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-slate-900 shadow-sm">
            {price.label}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <Star className="size-3 fill-white" /> Verified listing
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="font-heading text-xl font-black leading-tight">{restaurant.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-white/85"><MapPin className="size-3.5" /> {restaurant.address}, {restaurant.city}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">
            {restaurant.description || "Discover a memorable dining experience with locally relevant menus and a welcoming atmosphere."}
          </p>

          {signatureDish?.name && (
            <div className="mt-4 rounded-2xl bg-orange-50 px-4 py-3 ring-1 ring-orange-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">Popular menu choice</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="truncate text-sm font-bold text-slate-900">{signatureDish.name}</span>
                {typeof signatureDish.price === "number" && <span className="shrink-0 text-xs font-black text-orange-700">{formatPrice(signatureDish.price)}</span>}
              </div>
            </div>
          )}

          {amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {amenities.map((amenity) => {
                const Icon = AMENITY_ICONS[amenity];
                return <span key={amenity} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-100">{Icon && <Icon className="size-2.5" />}{amenity}</span>;
              })}
              {extraCount > 0 && <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">+{extraCount} more</span>}
            </div>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Typical budget</p>
              <p className="mt-1 text-sm font-black text-slate-900">{startingPrice ? `From ${formatPrice(startingPrice)}` : price.range}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black text-orange-600">View menu <span className="transition-transform group-hover:translate-x-1">→</span></span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/[0.05] bg-white shadow-sm">
      <div className="aspect-[16/10] animate-pulse bg-muted/50" />
      <div className="space-y-3 p-5"><div className="h-5 w-3/4 animate-pulse rounded bg-muted/50" /><div className="h-3 w-full animate-pulse rounded bg-muted/50" /><div className="h-3 w-2/3 animate-pulse rounded bg-muted/50" /><div className="h-14 animate-pulse rounded-2xl bg-muted/50" /></div>
    </div>
  );
}
