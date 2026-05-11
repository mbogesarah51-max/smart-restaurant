"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  UtensilsCrossed,
} from "lucide-react";
import { RestaurantCard, RestaurantCardSkeleton } from "./restaurant-card";
import type { SearchParams, SearchResult } from "@/app/actions/restaurant";

const CITIES = [
  "Yaoundé", "Douala", "Bamenda", "Bafoussam", "Limbe",
  "Buea", "Kribi", "Garoua", "Maroua", "Bertoua",
];

const PRICE_RANGES = [
  { value: "BUDGET", label: "Budget", icon: "$" },
  { value: "MODERATE", label: "Moderate", icon: "$$" },
  { value: "PREMIUM", label: "Premium", icon: "$$$" },
  { value: "LUXURY", label: "Luxury", icon: "$$$$" },
];

const AMENITIES = [
  "Wi-Fi", "Parking", "Air Conditioning", "Outdoor Seating",
  "Live Music", "TV/Screens", "Private Dining", "Wheelchair Accessible",
  "Kids Friendly", "Hookah/Shisha", "VIP Section", "Generator/Power Backup",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface Props {
  initialData: SearchResult;
  initialParams: SearchParams;
  basePath?: string; // "/explore" for public, "/dashboard/explore" for dashboard
  detailBasePath?: string; // "/restaurants" for public, "/dashboard/restaurants" for dashboard
}

export function ExploreRestaurants({ initialData, initialParams, basePath = "/dashboard/explore", detailBasePath = "/dashboard/restaurants" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialParams.query || "");
  const [selectedPrices, setSelectedPrices] = useState<string[]>(initialParams.priceRange || []);
  const [selectedCity, setSelectedCity] = useState(initialParams.city || "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialParams.amenities || []);
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [view, setView] = useState<"grid" | "map">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("chopwise_explore_view") as "grid" | "map") || "grid";
    }
    return "grid";
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const data = initialData;
  const activeFilterCount = selectedPrices.length + (selectedCity ? 1 : 0) + selectedAmenities.length;

  // Persist view preference
  useEffect(() => {
    localStorage.setItem("chopwise_explore_view", view);
  }, [view]);

  // Build URL and navigate
  const applyFilters = useCallback((overrides?: { page?: number }) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedPrices.length > 0) params.set("price", selectedPrices.join(","));
    if (selectedCity) params.set("city", selectedCity);
    if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
    if (sort !== "newest") params.set("sort", sort);
    if (overrides?.page && overrides.page > 1) params.set("page", String(overrides.page));

    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  }, [query, selectedPrices, selectedCity, selectedAmenities, sort, router, basePath]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);
    return () => clearTimeout(timer);
  // Only trigger on query change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function clearFilters() {
    setSelectedPrices([]);
    setSelectedCity("");
    setSelectedAmenities([]);
    setSort("newest");
    setQuery("");
    startTransition(() => {
      router.push(basePath);
    });
  }

  function togglePrice(value: string) {
    setSelectedPrices((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  }

  function toggleAmenity(value: string) {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          {PRICE_RANGES.map((pr) => {
            const selected = selectedPrices.includes(pr.value);
            return (
              <button
                key={pr.value}
                type="button"
                onClick={() => togglePrice(pr.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selected
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
                }`}
              >
                <div className={`size-4 rounded border flex items-center justify-center ${selected ? "bg-brand-orange border-brand-orange" : "border-border"}`}>
                  {selected && <Check className="size-3 text-white" />}
                </div>
                {pr.icon} {pr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">City</Label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Amenities</Label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => {
            const selected = selectedAmenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selected
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Sort By</Label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "price_asc" | "price_desc")}
          className="w-full h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => { applyFilters(); setFilterOpen(false); }}
          className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Explore Restaurants</h1>
        <p className="text-muted-foreground mt-1">Discover the best dining spots near you</p>
      </div>

      {/* Search + controls */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="pl-9 h-10 rounded-xl"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filter button — mobile: sheet, desktop: inline */}
        <div className="lg:hidden">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger
              render={
                <button className="relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors" />
              }
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 size-5 flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-4">Filters</h3>
              {filterContent}
            </SheetContent>
          </Sheet>
        </div>

        {/* View toggle */}
        <div className="flex border border-border/60 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-brand-orange text-white" : "text-muted-foreground hover:bg-muted/80"}`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("map")}
            className={`p-2 transition-colors ${view === "map" ? "bg-brand-orange text-white" : "text-muted-foreground hover:bg-muted/80"}`}
          >
            <MapIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {selectedPrices.map((p) => (
            <button key={p} onClick={() => togglePrice(p)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium hover:bg-brand-orange/20">
              {PRICE_RANGES.find((pr) => pr.value === p)?.label}
              <X className="size-3" />
            </button>
          ))}
          {selectedCity && (
            <button onClick={() => setSelectedCity("")} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium hover:bg-brand-orange/20">
              {selectedCity}
              <X className="size-3" />
            </button>
          )}
          {selectedAmenities.map((a) => (
            <button key={a} onClick={() => toggleAmenity(a)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium hover:bg-brand-orange/20">
              {a}
              <X className="size-3" />
            </button>
          ))}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline">
            Clear all
          </button>
        </div>
      )}

      {/* Desktop layout: sidebar filters + content */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 rounded-xl border border-border/50 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Filters</h3>
            {filterContent}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {isPending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isPending && data.restaurants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <UtensilsCrossed className="size-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {activeFilterCount > 0 || query ? "No restaurants found" : "Restaurants coming soon!"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {activeFilterCount > 0 || query
                  ? "Try adjusting your filters or search query."
                  : "Check back later — restaurants are being added to the platform."}
              </p>
              {(activeFilterCount > 0 || query) && (
                <button onClick={clearFilters} className="mt-4 text-sm font-medium text-brand-orange hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!isPending && data.restaurants.length > 0 && (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} detailBasePath={detailBasePath} />
                  ))}
                </div>
              ) : (
                <ExploreMapView restaurants={data.restaurants} detailBasePath={detailBasePath} />
              )}

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={data.page <= 1}
                    onClick={() => applyFilters({ page: data.page - 1 })}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground px-3">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    disabled={data.page >= data.totalPages}
                    onClick={() => applyFilters({ page: data.page + 1 })}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-3">
                Showing {data.restaurants.length} of {data.total} restaurant{data.total !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Map View ────────────────────────────────────────────────────────────────

function ExploreMapView({ restaurants, detailBasePath = "/dashboard/restaurants" }: { restaurants: (import("@/generated/prisma/client").Restaurant & { menuItems: { id: string }[] })[]; detailBasePath?: string }) {
  const [mounted, setMounted] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);
  const [leafletIcon, setLeafletIcon] = useState<import("leaflet").Icon | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, L]) => {
      setMapComponents({ MapContainer: rl.MapContainer, TileLayer: rl.TileLayer, Marker: rl.Marker, Popup: rl.Popup });
      setLeafletIcon(L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41],
      }));
    });
  }, []);

  const withCoords = restaurants.filter((r) => r.latitude && r.longitude);

  if (!mounted || !MapComponents || !leafletIcon) {
    return <div className="w-full h-[500px] rounded-xl bg-muted/50 animate-pulse" />;
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;
  const center: [number, number] = withCoords.length > 0
    ? [withCoords[0].latitude!, withCoords[0].longitude!]
    : [5.95, 10.15]; // Center of Cameroon

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-border/50">
      <MapContainer center={center} zoom={withCoords.length > 0 ? 12 : 6} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {withCoords.map((r) => (
          <Marker key={r.id} position={[r.latitude!, r.longitude!]} icon={leafletIcon}>
            <Popup>
              <div className="w-48">
                {r.bannerImage && (
                  <img src={r.bannerImage} alt={r.name} className="w-full h-20 object-cover rounded-t-md -mt-3 -mx-0" />
                )}
                <div className="py-2">
                  <h4 className="font-semibold text-sm">{r.name}</h4>
                  <p className="text-xs text-gray-500">{r.city}</p>
                  <a href={`${detailBasePath}/${r.slug}`} className="text-xs font-medium text-orange-500 hover:underline mt-1 inline-block">
                    View Details →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {withCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <p className="text-sm text-muted-foreground bg-white px-4 py-2 rounded-lg shadow">No restaurants with location data</p>
        </div>
      )}
    </div>
  );
}
