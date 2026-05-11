"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Check,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { updateRestaurant } from "@/app/actions/restaurant";
import type { RestaurantWithDetails } from "@/types";

const TABS = ["Basic Info", "Location", "Images", "Description", "Amenities", "Schedule"] as const;
type Tab = (typeof TABS)[number];

const CITIES = [
  "Yaoundé", "Douala", "Bamenda", "Bafoussam", "Limbe",
  "Buea", "Kribi", "Garoua", "Maroua", "Bertoua",
];

const PRICE_RANGES = [
  { value: "BUDGET", label: "Budget", icon: "$" },
  { value: "MODERATE", label: "Moderate", icon: "$$" },
  { value: "PREMIUM", label: "Premium", icon: "$$$" },
  { value: "LUXURY", label: "Luxury", icon: "$$$$" },
] as const;

const AMENITIES = [
  "Wi-Fi", "Parking", "Air Conditioning", "Outdoor Seating",
  "Live Music", "TV/Screens", "Private Dining", "Wheelchair Accessible",
  "Kids Friendly", "Hookah/Shisha", "VIP Section", "Generator/Power Backup",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:30`);
}
TIME_OPTIONS.push("00:00");

export function RestaurantEditPage({ restaurant }: { restaurant: RestaurantWithDetails }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState(restaurant.name);
  const [phone, setPhone] = useState(restaurant.phone);
  const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp || "");
  const [email, setEmail] = useState(restaurant.email || "");
  const [address, setAddress] = useState(restaurant.address);
  const [city, setCity] = useState(restaurant.city);
  const [priceRange, setPriceRange] = useState(restaurant.priceRange);
  const [latitude, setLatitude] = useState<number | null>(restaurant.latitude);
  const [longitude, setLongitude] = useState<number | null>(restaurant.longitude);
  const [bannerImage, setBannerImage] = useState(restaurant.bannerImage || "");
  const [galleryImages, setGalleryImages] = useState<string[]>(restaurant.galleryImages);
  const [description, setDescription] = useState(restaurant.description || "");
  const [amenities, setAmenities] = useState<string[]>(restaurant.amenities);
  const [availability, setAvailability] = useState(
    restaurant.availabilitySlots.length > 0
      ? restaurant.availabilitySlots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime,
          closeTime: s.closeTime,
          isActive: s.isActive,
        }))
      : DAYS.map((_, i) => ({ dayOfWeek: i, openTime: "10:00", closeTime: "22:00", isActive: i < 6 }))
  );

  async function save() {
    setSaving(true);
    try {
      const result = await updateRestaurant(restaurant.id, {
        name, phone,
        whatsapp: whatsapp || undefined,
        email: email || undefined,
        address, city,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        priceRange: priceRange as "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY",
        bannerImage: bannerImage || undefined,
        galleryImages,
        description: description || undefined,
        amenities,
        availability,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Restaurant updated!");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const [generating, setGenerating] = useState(false);
  async function generateDescription() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, priceRange, amenities }),
      });
      const result = await res.json();
      if (result.description) {
        setDescription(result.description);
        toast.success("Description generated!");
      } else {
        toast.error(result.error || "Failed to generate");
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/restaurant"
          className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-heading text-foreground">Edit Restaurant</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{restaurant.name}</span>
            {restaurant.isApproved ? (
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="size-2.5 mr-0.5" /> Approved
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">
                <Clock className="size-2.5 mr-0.5" /> Pending
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          {activeTab === "Basic Info" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Defaults to phone" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CITIES.map((c) => (
                    <button key={c} type="button" onClick={() => setCity(c)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${city === c ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border/60 text-muted-foreground hover:border-brand-orange/40"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRICE_RANGES.map((pr) => (
                    <button key={pr.value} type="button" onClick={() => setPriceRange(pr.value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${priceRange === pr.value ? "border-brand-orange bg-brand-orange/5" : "border-border/40 hover:border-brand-orange/30"}`}>
                      <span className={`text-lg font-bold ${priceRange === pr.value ? "text-brand-orange" : "text-foreground"}`}>{pr.icon}</span>
                      <span className="text-xs font-medium">{pr.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Location" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Click on the map to update your location.</p>
              <MapPickerWrapper latitude={latitude} longitude={longitude} onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={latitude ?? ""} onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={longitude ?? ""} onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
              </div>
              {latitude && longitude && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-brand-orange" />
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              )}
            </div>
          )}

          {activeTab === "Images" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Banner Image</h3>
                <ImageUpload value={bannerImage} onChange={(v) => setBannerImage(v as string)} folder="restaurants/banners" aspectRatio="banner" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Gallery</h3>
                <ImageUpload value={galleryImages} onChange={(v) => setGalleryImages(v as string[])} folder="restaurants/gallery" multiple maxFiles={6} aspectRatio="video" />
              </div>
            </div>
          )}

          {activeTab === "Description" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <button
                  onClick={generateDescription}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                  Generate with AI
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe your restaurant..."
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 outline-none resize-none"
              />
            </div>
          )}

          {activeTab === "Amenities" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select the amenities your restaurant offers.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES.map((a) => {
                  const selected = amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => setAmenities(selected ? amenities.filter((x) => x !== a) : [...amenities, a])} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${selected ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border/60 text-muted-foreground hover:border-brand-orange/40"}`}>
                      <div className={`size-4 rounded border flex items-center justify-center ${selected ? "bg-brand-orange border-brand-orange" : "border-border"}`}>
                        {selected && <Check className="size-3 text-white" />}
                      </div>
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "Schedule" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Set your weekly opening hours.</p>
              {availability.map((slot) => (
                <div key={slot.dayOfWeek} className={`flex items-center gap-3 p-3 rounded-lg border ${slot.isActive ? "border-border/60 bg-white" : "border-border/30 bg-muted/30"}`}>
                  <button
                    type="button"
                    onClick={() => setAvailability(availability.map((s) => s.dayOfWeek === slot.dayOfWeek ? { ...s, isActive: !s.isActive } : s))}
                    className={`size-5 rounded border flex items-center justify-center shrink-0 ${slot.isActive ? "bg-brand-orange border-brand-orange" : "border-border"}`}
                  >
                    {slot.isActive && <Check className="size-3 text-white" />}
                  </button>
                  <span className={`w-24 text-sm font-medium ${slot.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {DAYS[slot.dayOfWeek]}
                  </span>
                  {slot.isActive ? (
                    <div className="flex items-center gap-2 flex-1">
                      <select value={slot.openTime} onChange={(e) => setAvailability(availability.map((s) => s.dayOfWeek === slot.dayOfWeek ? { ...s, openTime: e.target.value } : s))} className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-xs text-muted-foreground">to</span>
                      <select value={slot.closeTime} onChange={(e) => setAvailability(availability.map((s) => s.dayOfWeek === slot.dayOfWeek ? { ...s, closeTime: e.target.value } : s))} className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring">
                        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Map picker wrapper with dynamic import to avoid SSR issues
function MapPickerWrapper({ latitude, longitude, onLocationChange }: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    latitude: number | null;
    longitude: number | null;
    onLocationChange: (lat: number, lng: number) => void;
  }> | null>(null);

  useEffect(() => {
    // Load leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([rl, L]) => {
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      function MapInner({ latitude, longitude, onLocationChange }: {
        latitude: number | null;
        longitude: number | null;
        onLocationChange: (lat: number, lng: number) => void;
      }) {
        function ClickHandler() {
          rl.useMapEvents({ click(e) { onLocationChange(e.latlng.lat, e.latlng.lng); } });
          return null;
        }
        const center: [number, number] = [latitude ?? 3.848, longitude ?? 11.502];
        return (
          <div className="w-full h-[300px] rounded-xl overflow-hidden border border-border/50">
            <rl.MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <rl.TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickHandler />
              {latitude && longitude && <rl.Marker position={[latitude, longitude]} icon={icon} />}
            </rl.MapContainer>
          </div>
        );
      }

      setMapComponent(() => MapInner);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center border border-border/50">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <MapComponent latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />;
}
