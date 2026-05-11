"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  MapPin,
  Store,
  Image as ImageIcon,
  FileText,
  Wifi,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import { createRestaurant } from "@/app/actions/restaurant";
import type { SafeUser } from "@/types";

const STEPS = [
  { label: "Basic Info", icon: Store },
  { label: "Location", icon: MapPin },
  { label: "Images", icon: ImageIcon },
  { label: "Description", icon: FileText },
  { label: "Amenities", icon: Wifi },
  { label: "Schedule", icon: Clock },
  { label: "Review", icon: ClipboardCheck },
];

const CITIES = [
  "Yaoundé", "Douala", "Bamenda", "Bafoussam", "Limbe",
  "Buea", "Kribi", "Garoua", "Maroua", "Bertoua",
];

const PRICE_RANGES = [
  { value: "BUDGET", label: "Budget", icon: "$", desc: "Under 3,000 FCFA" },
  { value: "MODERATE", label: "Moderate", icon: "$$", desc: "3,000 – 8,000 FCFA" },
  { value: "PREMIUM", label: "Premium", icon: "$$$", desc: "8,000 – 20,000 FCFA" },
  { value: "LUXURY", label: "Luxury", icon: "$$$$", desc: "Above 20,000 FCFA" },
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

type WizardData = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  priceRange: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY";
  latitude: number | null;
  longitude: number | null;
  bannerImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  availability: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isActive: boolean;
  }[];
};

const defaultAvailability = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openTime: "10:00",
  closeTime: "22:00",
  isActive: i < 6, // Mon–Sat open, Sunday closed by default
}));

function loadDraft(): Partial<WizardData> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("chopwise_restaurant_draft");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveDraft(data: WizardData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("chopwise_restaurant_draft", JSON.stringify(data));
  } catch {}
}

function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("chopwise_restaurant_draft");
}

export function RestaurantSetupWizard({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState<WizardData>(() => {
    const draft = loadDraft();
    return {
      name: draft.name || "",
      phone: draft.phone || user.phone || "",
      whatsapp: draft.whatsapp || "",
      email: draft.email || "",
      address: draft.address || "",
      city: draft.city || "",
      priceRange: draft.priceRange || "MODERATE",
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
      bannerImage: draft.bannerImage || "",
      galleryImages: draft.galleryImages || [],
      description: draft.description || "",
      amenities: draft.amenities || [],
      availability: draft.availability || defaultAvailability,
    };
  });

  // Auto-save draft
  useEffect(() => { saveDraft(data); }, [data]);

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
    setErrors({});
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.name.trim() || data.name.trim().length < 2) e.name = "Restaurant name is required";
      if (!data.phone.trim() || data.phone.trim().length < 9) e.phone = "Valid phone number is required";
      if (!data.address.trim() || data.address.trim().length < 5) e.address = "Address is required";
      if (!data.city) e.city = "Please select a city";
    }
    if (step === 2) {
      if (!data.bannerImage) e.bannerImage = "A banner image is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = await createRestaurant({
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp || undefined,
        email: data.email || undefined,
        address: data.address,
        city: data.city,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        priceRange: data.priceRange,
        bannerImage: data.bannerImage || undefined,
        galleryImages: data.galleryImages,
        description: data.description || undefined,
        amenities: data.amenities,
        availability: data.availability,
      });

      if (!result.success) {
        toast.error(result.message);
        setIsSubmitting(false);
        return;
      }

      clearDraft();
      toast.success("Restaurant submitted for approval!");
      router.push("/dashboard/restaurant");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-foreground">Set Up Your Restaurant</h1>
        <p className="text-muted-foreground mt-1">Complete all steps to submit your restaurant for approval.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <button
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                i === step
                  ? "bg-brand-orange text-white"
                  : i < step
                    ? "bg-brand-orange/10 text-brand-orange cursor-pointer hover:bg-brand-orange/20"
                    : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-3" /> : <s.icon className="size-3" />}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-4 h-px mx-0.5 ${i < step ? "bg-brand-orange" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          {step === 0 && <StepBasicInfo data={data} update={update} errors={errors} />}
          {step === 1 && <StepLocation data={data} update={update} />}
          {step === 2 && <StepImages data={data} update={update} errors={errors} />}
          {step === 3 && <StepDescription data={data} update={update} />}
          {step === 4 && <StepAmenities data={data} update={update} />}
          {step === 5 && <StepSchedule data={data} update={update} />}
          {step === 6 && <StepReview data={data} />}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            step === 0
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-foreground hover:bg-muted/80"
          }`}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
          >
            Next
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Submit for Approval
          </button>
        )}
      </div>
    </div>
  );
}

// ─── STEP 1: Basic Info ──────────────────────────────────────────────────────

function StepBasicInfo({ data, update, errors }: { data: WizardData; update: (p: Partial<WizardData>) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Restaurant Name *</Label>
        <Input id="name" value={data.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Chez Maurice" />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" type="tel" value={data.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+237 6XX XXX XXX" />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input id="whatsapp" type="tel" value={data.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} placeholder="Defaults to phone number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="restaurant@example.com" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input id="address" value={data.address} onChange={(e) => update({ address: e.target.value })} placeholder="Street address" />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>

      <div className="space-y-2">
        <Label>City *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => update({ city })}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                data.city === city
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-border/60 text-muted-foreground hover:border-brand-orange/40 hover:text-foreground"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
      </div>

      <div className="space-y-2">
        <Label>Price Range *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRICE_RANGES.map((pr) => (
            <button
              key={pr.value}
              type="button"
              onClick={() => update({ priceRange: pr.value })}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                data.priceRange === pr.value
                  ? "border-brand-orange bg-brand-orange/5 shadow-sm"
                  : "border-border/40 hover:border-brand-orange/30"
              }`}
            >
              <span className={`text-lg font-bold ${data.priceRange === pr.value ? "text-brand-orange" : "text-foreground"}`}>{pr.icon}</span>
              <span className="text-xs font-semibold text-foreground">{pr.label}</span>
              <span className="text-[10px] text-muted-foreground">{pr.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: Location ────────────────────────────────────────────────────────

function StepLocation({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Pin Your Location</h3>
        <p className="text-sm text-muted-foreground mb-4">Click on the map to set your restaurant&apos;s location, or enter coordinates manually.</p>
      </div>

      <MapPicker
        latitude={data.latitude}
        longitude={data.longitude}
        onLocationChange={(lat, lng) => update({ latitude: lat, longitude: lng })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={data.latitude ?? ""}
            onChange={(e) => update({ latitude: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="e.g. 3.848"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={data.longitude ?? ""}
            onChange={(e) => update({ longitude: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="e.g. 11.502"
          />
        </div>
      </div>

      {data.latitude && data.longitude && (
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <MapPin className="size-3.5 text-brand-orange" />
          Location set: {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
        </p>
      )}

      <p className="text-xs text-muted-foreground">You can skip this step and add your location later.</p>
    </div>
  );
}

function MapPicker({ latitude, longitude, onLocationChange }: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center border border-border/50">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <MapPickerInner latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />;
}

function MapPickerInner({ latitude, longitude, onLocationChange }: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  // Dynamic import to avoid SSR issues
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    useMapEvents: typeof import("react-leaflet").useMapEvents;
  } | null>(null);

  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    // Load CSS
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
      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        useMapEvents: rl.useMapEvents,
      });
      setLeaflet(L);
    });
  }, []);

  if (!MapComponents || !leaflet) {
    return (
      <div className="w-full h-[300px] rounded-xl bg-muted/50 flex items-center justify-center border border-border/50">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = MapComponents;
  const defaultCenter: [number, number] = [latitude ?? 3.848, longitude ?? 11.502]; // Yaoundé default

  const icon = leaflet.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  function ClickHandler() {
    useMapEvents({
      click(e) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-border/50">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler />
        {latitude && longitude && <Marker position={[latitude, longitude]} icon={icon} />}
      </MapContainer>
    </div>
  );
}

// ─── STEP 3: Images ──────────────────────────────────────────────────────────

function StepImages({ data, update, errors }: { data: WizardData; update: (p: Partial<WizardData>) => void; errors: Record<string, string> }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Banner Image *</h3>
        <p className="text-sm text-muted-foreground mb-3">This is the main image shown on your restaurant listing.</p>
        <ImageUpload
          value={data.bannerImage}
          onChange={(v) => update({ bannerImage: v as string })}
          folder="restaurants/banners"
          aspectRatio="banner"
        />
        {errors.bannerImage && <p className="text-sm text-destructive mt-1">{errors.bannerImage}</p>}
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-1">Gallery Images</h3>
        <p className="text-sm text-muted-foreground mb-3">Add up to 6 photos of your restaurant (interior, food, ambience).</p>
        <ImageUpload
          value={data.galleryImages}
          onChange={(v) => update({ galleryImages: v as string[] })}
          folder="restaurants/gallery"
          multiple
          maxFiles={6}
          aspectRatio="video"
        />
      </div>
    </div>
  );
}

// ─── STEP 4: Description ─────────────────────────────────────────────────────

function StepDescription({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  const [generating, setGenerating] = useState(false);

  async function generateDescription() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          city: data.city,
          priceRange: data.priceRange,
          amenities: data.amenities,
        }),
      });
      const result = await res.json();
      if (result.description) {
        update({ description: result.description });
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Restaurant Description</h3>
          <p className="text-sm text-muted-foreground">Describe your restaurant to attract diners.</p>
        </div>
        <button
          onClick={generateDescription}
          disabled={generating || !data.name}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          Generate with AI
        </button>
      </div>

      <textarea
        value={data.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Tell diners what makes your restaurant special..."
        rows={5}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 outline-none resize-none"
      />
      <p className="text-xs text-muted-foreground">{data.description.length}/500 characters</p>
    </div>
  );
}

// ─── STEP 5: Amenities ───────────────────────────────────────────────────────

function StepAmenities({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  function toggle(amenity: string) {
    const next = data.amenities.includes(amenity)
      ? data.amenities.filter((a) => a !== amenity)
      : [...data.amenities, amenity];
    update({ amenities: next });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Amenities</h3>
        <p className="text-sm text-muted-foreground mb-4">Select the amenities your restaurant offers.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AMENITIES.map((amenity) => {
          const selected = data.amenities.includes(amenity);
          return (
            <button
              key={amenity}
              type="button"
              onClick={() => toggle(amenity)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                selected
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
              }`}
            >
              <div className={`size-4 rounded border flex items-center justify-center transition-colors ${
                selected ? "bg-brand-orange border-brand-orange" : "border-border"
              }`}>
                {selected && <Check className="size-3 text-white" />}
              </div>
              {amenity}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── STEP 6: Schedule ────────────────────────────────────────────────────────

function StepSchedule({ data, update }: { data: WizardData; update: (p: Partial<WizardData>) => void }) {
  function updateSlot(dayOfWeek: number, field: string, value: string | boolean) {
    const next = data.availability.map((slot) =>
      slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
    );
    update({ availability: next });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Opening Hours</h3>
        <p className="text-sm text-muted-foreground mb-4">Set your weekly schedule.</p>
      </div>

      <div className="space-y-2">
        {data.availability.map((slot) => (
          <div
            key={slot.dayOfWeek}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              slot.isActive ? "border-border/60 bg-white" : "border-border/30 bg-muted/30"
            }`}
          >
            <button
              type="button"
              onClick={() => updateSlot(slot.dayOfWeek, "isActive", !slot.isActive)}
              className={`size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                slot.isActive ? "bg-brand-orange border-brand-orange" : "border-border"
              }`}
            >
              {slot.isActive && <Check className="size-3 text-white" />}
            </button>

            <span className={`w-24 text-sm font-medium ${slot.isActive ? "text-foreground" : "text-muted-foreground"}`}>
              {DAYS[slot.dayOfWeek]}
            </span>

            {slot.isActive ? (
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={slot.openTime}
                  onChange={(e) => updateSlot(slot.dayOfWeek, "openTime", e.target.value)}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">to</span>
                <select
                  value={slot.closeTime}
                  onChange={(e) => updateSlot(slot.dayOfWeek, "closeTime", e.target.value)}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
                >
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 7: Review ──────────────────────────────────────────────────────────

function StepReview({ data }: { data: WizardData }) {
  const priceLabel = PRICE_RANGES.find((p) => p.value === data.priceRange);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Review Your Restaurant</h3>
        <p className="text-sm text-muted-foreground">Make sure everything looks correct before submitting.</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Basic Information</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground font-medium">{data.name || "—"}</span>
          <span className="text-muted-foreground">Phone</span>
          <span className="text-foreground">{data.phone || "—"}</span>
          <span className="text-muted-foreground">WhatsApp</span>
          <span className="text-foreground">{data.whatsapp || data.phone || "—"}</span>
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground">{data.email || "—"}</span>
          <span className="text-muted-foreground">Address</span>
          <span className="text-foreground">{data.address}, {data.city}</span>
          <span className="text-muted-foreground">Price Range</span>
          <span className="text-foreground">{priceLabel?.icon} {priceLabel?.label}</span>
        </div>
      </div>

      {/* Location */}
      {data.latitude && data.longitude && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Location</h4>
          <p className="text-sm text-muted-foreground">{data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}</p>
        </div>
      )}

      {/* Images */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Images</h4>
        {data.bannerImage ? (
          <img src={data.bannerImage} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
        ) : (
          <p className="text-sm text-destructive">No banner image</p>
        )}
        {data.galleryImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {data.galleryImages.map((url) => (
              <img key={url} src={url} alt="Gallery" className="w-full h-20 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Description</h4>
          <p className="text-sm text-muted-foreground">{data.description}</p>
        </div>
      )}

      {/* Amenities */}
      {data.amenities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Amenities</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.amenities.map((a) => (
              <span key={a} className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-orange/10 text-brand-orange">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Opening Hours</h4>
        <div className="grid gap-1 text-sm">
          {data.availability.map((slot) => (
            <div key={slot.dayOfWeek} className="flex items-center gap-3">
              <span className="w-24 text-muted-foreground">{DAYS[slot.dayOfWeek]}</span>
              <span className={slot.isActive ? "text-foreground" : "text-muted-foreground"}>
                {slot.isActive ? `${slot.openTime} – ${slot.closeTime}` : "Closed"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
