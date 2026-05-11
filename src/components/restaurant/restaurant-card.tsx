"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Wifi, Car, Wind, TreePine, UtensilsCrossed } from "lucide-react";
import type { Restaurant } from "@/generated/prisma/client";

const PRICE_LABELS: Record<string, { icon: string; label: string }> = {
  BUDGET: { icon: "$", label: "Budget" },
  MODERATE: { icon: "$$", label: "Moderate" },
  PREMIUM: { icon: "$$$", label: "Premium" },
  LUXURY: { icon: "$$$$", label: "Luxury" },
};

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  "Parking": Car,
  "Air Conditioning": Wind,
  "Outdoor Seating": TreePine,
};

interface RestaurantCardProps {
  restaurant: Restaurant & { menuItems: { id: string }[] };
  detailBasePath?: string;
}

export function RestaurantCard({ restaurant, detailBasePath = "/dashboard/restaurants" }: RestaurantCardProps) {
  const price = PRICE_LABELS[restaurant.priceRange] || PRICE_LABELS.MODERATE;
  const amenities = restaurant.amenities.slice(0, 4);
  const extraCount = restaurant.amenities.length - 4;

  return (
    <Link href={`${detailBasePath}/${restaurant.slug}`} className="group block">
      <div className="rounded-xl border border-border/50 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-brand-orange/20 transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-orange/20 to-amber-100">
          {restaurant.bannerImage ? (
            <Image
              src={restaurant.bannerImage}
              alt={restaurant.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <UtensilsCrossed className="size-10 text-brand-orange/30" />
            </div>
          )}
          {/* Price badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-foreground shadow-sm">
            {price.icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[15px] font-semibold text-foreground group-hover:text-brand-orange transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="text-xs truncate">{restaurant.address}, {restaurant.city}</span>
          </div>

          {restaurant.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground"
                >
                  {a}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  +{extraCount} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground">
              {restaurant.menuItems.length} item{restaurant.menuItems.length !== 1 ? "s" : ""} on menu
            </span>
            <span className="text-xs font-semibold text-brand-orange group-hover:translate-x-0.5 transition-transform">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-white overflow-hidden shadow-sm">
      <div className="aspect-[16/10] bg-muted/50 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-muted/50 rounded animate-pulse w-full" />
        <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-12 bg-muted/50 rounded-full animate-pulse" />
          <div className="h-5 w-14 bg-muted/50 rounded-full animate-pulse" />
          <div className="h-5 w-10 bg-muted/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
