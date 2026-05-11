"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ReservationForm } from "@/components/shared/reservation-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  ChevronRight,
  ExternalLink,
  UtensilsCrossed,
  Coffee,
  IceCream,
  MoreHorizontal,
  CalendarCheck,
  Loader2,
  Wifi,
  Car,
  Wind,
  TreePine,
  Music,
  Tv,
  Lock,
  Accessibility,
  Baby,
  Flame,
  Crown,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import type { RestaurantWithDetails } from "@/types";

const PRICE_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  BUDGET: { icon: "$", label: "Budget", color: "bg-emerald-100 text-emerald-700" },
  MODERATE: { icon: "$$", label: "Moderate", color: "bg-blue-100 text-blue-700" },
  PREMIUM: { icon: "$$$", label: "Premium", color: "bg-purple-100 text-purple-700" },
  LUXURY: { icon: "$$$$", label: "Luxury", color: "bg-amber-100 text-amber-700" },
};

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi, "Parking": Car, "Air Conditioning": Wind, "Outdoor Seating": TreePine,
  "Live Music": Music, "TV/Screens": Tv, "Private Dining": Lock, "Wheelchair Accessible": Accessibility,
  "Kids Friendly": Baby, "Hookah/Shisha": Flame, "VIP Section": Crown, "Generator/Power Backup": Zap,
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MENU_SECTIONS = [
  { key: "FOOD" as const, label: "Food", icon: UtensilsCrossed },
  { key: "DRINK" as const, label: "Drinks", icon: Coffee },
  { key: "DESSERT" as const, label: "Desserts", icon: IceCream },
  { key: "OTHER" as const, label: "Other", icon: MoreHorizontal },
];

export function RestaurantDetail({ restaurant, explorePath = "/dashboard/explore" }: { restaurant: RestaurantWithDetails; explorePath?: string }) {
  const price = PRICE_LABELS[restaurant.priceRange] || PRICE_LABELS.MODERATE;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [reserveOpen, setReserveOpen] = useState(false);

  const allImages = [
    ...(restaurant.bannerImage ? [restaurant.bannerImage] : []),
    ...restaurant.galleryImages,
  ];

  // Today's hours
  const todayIndex = (new Date().getDay() + 6) % 7; // JS Sunday=0, we need Monday=0
  const todaySlot = restaurant.availabilitySlots.find((s) => s.dayOfWeek === todayIndex);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  return (
    <>
      <ImageLightbox images={allImages} initialIndex={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      <ReservationForm restaurant={restaurant} open={reserveOpen} onClose={() => setReserveOpen(false)} />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href={explorePath === "/explore" ? "/" : "/dashboard"} className="hover:text-foreground transition-colors">
            {explorePath === "/explore" ? "Home" : "Dashboard"}
          </Link>
          <ChevronRight className="size-3" />
          <Link href={explorePath} className="hover:text-foreground transition-colors">Explore</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{restaurant.name}</span>
        </nav>

        {/* Hero */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="aspect-[21/9] relative">
            {restaurant.bannerImage ? (
              <Image
                src={restaurant.bannerImage}
                alt={restaurant.name}
                fill
                className="object-cover cursor-pointer"
                sizes="100vw"
                priority
                onClick={() => openLightbox(0)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/30 to-amber-200 flex items-center justify-center">
                <UtensilsCrossed className="size-16 text-brand-orange/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          {/* Hero content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <MapPin className="size-3.5" />
                    {restaurant.address}, {restaurant.city}
                  </div>
                  <Badge variant="secondary" className={`border-0 text-xs ${price.color}`}>
                    {price.icon} {price.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {restaurant.galleryImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {restaurant.galleryImages.map((url, i) => (
              <button
                key={url}
                onClick={() => openLightbox(restaurant.bannerImage ? i + 1 : i)}
                className="relative shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden border border-border/40 hover:border-brand-orange/40 transition-colors group"
              >
                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="150px" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {restaurant.description && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{restaurant.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {restaurant.amenities.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading">Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {restaurant.amenities.map((a) => {
                      const Icon = AMENITY_ICONS[a] || UtensilsCrossed;
                      return (
                        <div key={a} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm">
                          <Icon className="size-4 text-brand-orange shrink-0" />
                          <span className="text-foreground">{a}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Menu */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Menu</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurant.menuItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No menu items available yet.</p>
                ) : (
                  <div className="space-y-6">
                    {MENU_SECTIONS.map(({ key, label, icon: Icon }) => {
                      const items = restaurant.menuItems.filter((i) => i.category === key);
                      if (items.length === 0) return null;
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className="size-4 text-brand-orange" />
                            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                          </div>
                          <div className="space-y-1">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-start gap-3 p-3 rounded-lg ${!item.isAvailable ? "opacity-50" : "hover:bg-muted/30"} transition-colors`}
                              >
                                {item.image && (
                                  <Image src={item.image} alt={item.name} width={56} height={56} className="size-14 rounded-lg object-cover shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between gap-2">
                                    <h4 className="text-sm font-medium text-foreground">{item.name}</h4>
                                    <span className="text-sm font-bold text-brand-orange whitespace-nowrap">{formatPrice(item.price)}</span>
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                  )}
                                  {!item.isAvailable && (
                                    <span className="text-[10px] font-medium text-destructive mt-1 inline-block">Currently Unavailable</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            {restaurant.availabilitySlots.length > 0 && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading">Opening Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Today highlight */}
                  {todaySlot && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${todaySlot.isActive ? "bg-emerald-50" : "bg-red-50"}`}>
                      <Clock className={`size-4 ${todaySlot.isActive ? "text-emerald-600" : "text-red-500"}`} />
                      <span className={`text-sm font-medium ${todaySlot.isActive ? "text-emerald-700" : "text-red-600"}`}>
                        {todaySlot.isActive ? `Open today: ${todaySlot.openTime} – ${todaySlot.closeTime}` : "Closed today"}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {restaurant.availabilitySlots.map((slot) => (
                      <div key={slot.dayOfWeek} className={`flex items-center justify-between px-3 py-1.5 rounded-md text-sm ${slot.dayOfWeek === todayIndex ? "bg-muted/50 font-medium" : ""}`}>
                        <span className={slot.isActive ? "text-foreground" : "text-muted-foreground"}>{DAYS[slot.dayOfWeek]}</span>
                        <span className={slot.isActive ? "text-foreground" : "text-muted-foreground"}>
                          {slot.isActive ? `${slot.openTime} – ${slot.closeTime}` : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Reserve CTA */}
            <Card className="border-brand-orange/30 bg-brand-orange/5 shadow-sm">
              <CardContent className="pt-6">
                <button
                  onClick={() => setReserveOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orange-hover hover:to-amber-600 text-white transition-colors shadow-md shadow-brand-orange/20"
                >
                  <CalendarCheck className="size-4" />
                  Reserve a Table
                </button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">Free to book — no hidden fees</p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <a href={`tel:${restaurant.phone}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange/10">
                    <Phone className="size-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-brand-orange">{restaurant.phone}</p>
                    <p className="text-[11px] text-muted-foreground">Tap to call</p>
                  </div>
                </a>

                {restaurant.whatsapp && (
                  <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                      <MessageCircle className="size-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-emerald-600">WhatsApp</p>
                      <p className="text-[11px] text-muted-foreground">Send a message</p>
                    </div>
                  </a>
                )}

                {restaurant.email && (
                  <a href={`mailto:${restaurant.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-blue-600">{restaurant.email}</p>
                      <p className="text-[11px] text-muted-foreground">Send email</p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {restaurant.latitude && restaurant.longitude && (
                  <LocationMap lat={restaurant.latitude} lng={restaurant.longitude} />
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{restaurant.address}, {restaurant.city}</p>
                </div>
                {restaurant.latitude && restaurant.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:underline"
                  >
                    Get Directions <ExternalLink className="size-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile sticky reserve bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/90 backdrop-blur-xl border-t border-border/40 lg:hidden">
          <button
            onClick={() => setReserveOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-lg shadow-brand-orange/20"
          >
            <CalendarCheck className="size-4" />
            Reserve a Table
          </button>
        </div>
        {/* Spacer for mobile sticky bar */}
        <div className="h-20 lg:hidden" />
      </div>
    </>
  );
}

// ─── Small location map ──────────────────────────────────────────────────────

function LocationMap({ lat, lng }: { lat: number; lng: number }) {
  const [mounted, setMounted] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
  } | null>(null);
  const [icon, setIcon] = useState<import("leaflet").Icon | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, L]) => {
      setMapComponents({ MapContainer: rl.MapContainer, TileLayer: rl.TileLayer, Marker: rl.Marker });
      setIcon(L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41],
      }));
    });
  }, []);

  if (!mounted || !MapComponents || !icon) {
    return <div className="w-full h-40 rounded-lg bg-muted/50 animate-pulse" />;
  }

  const { MapContainer, TileLayer, Marker } = MapComponents;
  return (
    <div className="w-full h-40 rounded-lg overflow-hidden border border-border/50">
      <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomControl={false} dragging={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
