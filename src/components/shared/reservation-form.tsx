"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Coffee,
  IceCream,
  MoreHorizontal,
  Minus,
  Plus,
  PartyPopper,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createReservation } from "@/app/actions/reservation";
import { CountdownTimer } from "./countdown-timer";
import type { RestaurantWithDetails } from "@/types";
import type { Reservation } from "@/generated/prisma/client";

const OCCASIONS = [
  "None", "Birthday", "Anniversary", "Business Meeting", "Date Night", "Other",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MENU_CATS = [
  { key: "FOOD" as const, label: "Food", icon: UtensilsCrossed },
  { key: "DRINK" as const, label: "Drinks", icon: Coffee },
  { key: "DESSERT" as const, label: "Desserts", icon: IceCream },
  { key: "OTHER" as const, label: "Other", icon: MoreHorizontal },
];

interface Props {
  restaurant: RestaurantWithDetails;
  open: boolean;
  onClose: () => void;
}

type PreOrderItem = { menuItemId: string; name: string; price: number; quantity: number };

export function ReservationForm({ restaurant, open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);

  // Step 1: Date & Time
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Step 2: Guests
  const [guestCount, setGuestCount] = useState(2);
  const [occasion, setOccasion] = useState("None");
  const [preferences, setPreferences] = useState("");

  // Step 3: Pre-order
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);

  // Step 4: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Selected day info
  const selectedDaySlot = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    const dow = (d.getDay() + 6) % 7;
    return restaurant.availabilitySlots.find((s) => s.dayOfWeek === dow && s.isActive) || null;
  }, [date, restaurant.availabilitySlots]);

  const selectedDayName = date ? DAYS[(new Date(date).getDay() + 6) % 7] : "";

  // Generate available times for selected day
  const availableTimes = useMemo(() => {
    if (!selectedDaySlot) return [];
    const times: string[] = [];
    const [openH, openM] = selectedDaySlot.openTime.split(":").map(Number);
    const [closeH, closeM] = selectedDaySlot.closeTime.split(":").map(Number);

    let h = openH, m = openM;
    const closeMinutes = closeH * 60 + closeM;

    while (h * 60 + m < closeMinutes) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      // If today, only show times at least 1 hour from now
      if (date === todayStr()) {
        const now = new Date();
        const cutoff = new Date(now.getTime() + 60 * 60 * 1000);
        const [tH, tM] = t.split(":").map(Number);
        if (tH < cutoff.getHours() || (tH === cutoff.getHours() && tM < cutoff.getMinutes())) {
          m += 30;
          if (m >= 60) { h++; m -= 60; }
          continue;
        }
      }

      times.push(t);
      m += 30;
      if (m >= 60) { h++; m -= 60; }
    }
    return times;
  }, [selectedDaySlot, date]);

  // Pre-order total
  const preOrderTotal = preOrderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function updatePreOrder(menuItemId: string, name: string, price: number, delta: number) {
    setPreOrderItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((i) => i.menuItemId !== menuItemId);
        return prev.map((i) => i.menuItemId === menuItemId ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { menuItemId, name, price, quantity: 1 }];
      return prev;
    });
  }

  function getItemQty(menuItemId: string) {
    return preOrderItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!date) { toast.error("Please select a date"); return false; }
      if (!selectedDaySlot) { toast.error(`Restaurant is closed on ${selectedDayName}`); return false; }
      if (!time) { toast.error("Please select a time"); return false; }
    }
    if (step === 3) {
      if (!termsAccepted) { toast.error("Please accept the terms"); return false; }
    }
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 3));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);

    const res = await createReservation({
      restaurantId: restaurant.id,
      date,
      time,
      guestCount,
      occasion: occasion !== "None" ? occasion : undefined,
      preferences: preferences.trim() || undefined,
      preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
    });

    if (!res.success) {
      toast.error(res.message);
      setSubmitting(false);
      return;
    }

    setResult(res.data!);
    setStep(4); // confirmation
    setSubmitting(false);
  }

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {step === 4 ? "Reservation Sent!" : "Reserve a Table"}
            </h2>
            <p className="text-xs text-muted-foreground">{restaurant.name}</p>
          </div>
          <button onClick={onClose} className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors">
            Close
          </button>
        </div>

        {/* Steps indicator */}
        {step < 4 && (
          <div className="flex gap-1 px-5 pt-4">
            {["Date & Time", "Guests", "Pre-order", "Confirm"].map((label, i) => (
              <div key={i} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-brand-orange" : "bg-muted/60"}`} />
                <p className={`text-[10px] mt-1 ${i === step ? "text-brand-orange font-medium" : "text-muted-foreground"}`}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 0 && (
            <StepDateTime
              date={date} setDate={setDate}
              time={time} setTime={setTime}
              selectedDaySlot={selectedDaySlot}
              selectedDayName={selectedDayName}
              availableTimes={availableTimes}
            />
          )}
          {step === 1 && (
            <StepGuests
              guestCount={guestCount} setGuestCount={setGuestCount}
              occasion={occasion} setOccasion={setOccasion}
              preferences={preferences} setPreferences={setPreferences}
            />
          )}
          {step === 2 && (
            <StepPreOrder
              menuItems={restaurant.menuItems.filter((i) => i.isAvailable)}
              getItemQty={getItemQty}
              updatePreOrder={updatePreOrder}
              preOrderTotal={preOrderTotal}
            />
          )}
          {step === 3 && (
            <StepReview
              restaurant={restaurant}
              date={date} time={time} guestCount={guestCount}
              occasion={occasion} preferences={preferences}
              preOrderItems={preOrderItems} preOrderTotal={preOrderTotal}
              termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted}
            />
          )}
          {step === 4 && result && (
            <ConfirmationScreen
              reservation={result}
              restaurantName={restaurant.name}
              onViewReservations={() => { onClose(); router.push("/dashboard/reservations"); }}
            />
          )}
        </div>

        {/* Footer navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border/40">
            <button
              onClick={step === 0 ? onClose : back}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="size-4" />
              {step === 0 ? "Cancel" : "Back"}
            </button>

            {step < 3 ? (
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
              >
                {step === 2 ? (preOrderItems.length > 0 ? "Next" : "Skip Pre-order") : "Next"}
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !termsAccepted}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Submit Reservation
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────

function StepDateTime({ date, setDate, time, setTime, selectedDaySlot, selectedDayName, availableTimes }: {
  date: string; setDate: (v: string) => void;
  time: string; setTime: (v: string) => void;
  selectedDaySlot: { openTime: string; closeTime: string } | null;
  selectedDayName: string;
  availableTimes: string[];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2"><Calendar className="size-4 text-brand-orange" /> Select Date</Label>
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime(""); }}
          min={todayStr()}
          max={maxDateStr()}
          className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
        />
      </div>

      {!date && (
        <div className="px-4 py-6 rounded-lg bg-muted/40 border border-dashed border-border text-center">
          <Calendar className="size-6 mx-auto text-muted-foreground/60 mb-2" />
          <p className="text-sm text-muted-foreground">Pick a date to see available times.</p>
        </div>
      )}

      {date && !selectedDaySlot && (
        <div className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
          Restaurant is closed on {selectedDayName}. Please choose another day.
        </div>
      )}

      {date && selectedDaySlot && (
        <>
          <div className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2">
            <Clock className="size-3.5" />
            Open on {selectedDayName}: {selectedDaySlot.openTime} – {selectedDaySlot.closeTime}
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2"><Clock className="size-4 text-brand-orange" /> Select Time</Label>
            {availableTimes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available times for today. Try another date.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      time === t
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────

function StepGuests({ guestCount, setGuestCount, occasion, setOccasion, preferences, setPreferences }: {
  guestCount: number; setGuestCount: (v: number) => void;
  occasion: string; setOccasion: (v: string) => void;
  preferences: string; setPreferences: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2"><Users className="size-4 text-brand-orange" /> Number of Guests</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
            className="flex items-center justify-center size-10 rounded-lg border border-border/60 text-foreground hover:bg-muted/80 transition-colors"
          >
            <Minus className="size-4" />
          </button>
          <span className="text-2xl font-bold text-foreground w-12 text-center">{guestCount}</span>
          <button
            type="button"
            onClick={() => setGuestCount(Math.min(20, guestCount + 1))}
            className="flex items-center justify-center size-10 rounded-lg border border-border/60 text-foreground hover:bg-muted/80 transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2"><PartyPopper className="size-4 text-brand-orange" /> Special Occasion</Label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOccasion(o)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                occasion === o
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-border/60 text-muted-foreground hover:border-brand-orange/40"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Special Requests (optional)</Label>
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="Allergies, seating preferences, etc."
          rows={3}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

function StepPreOrder({ menuItems, getItemQty, updatePreOrder, preOrderTotal }: {
  menuItems: RestaurantWithDetails["menuItems"];
  getItemQty: (id: string) => number;
  updatePreOrder: (id: string, name: string, price: number, delta: number) => void;
  preOrderTotal: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Pre-select your meals</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Optional — you can also order at the restaurant</p>
      </div>

      {menuItems.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No menu items available for pre-order.</p>
      ) : (
        <div className="space-y-5">
          {MENU_CATS.map(({ key, label, icon: Icon }) => {
            const items = menuItems.filter((i) => i.category === key);
            if (!items.length) return null;
            return (
              <div key={key}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="size-3.5 text-brand-orange" />
                  <span className="text-xs font-semibold text-foreground">{label}</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => {
                    const qty = getItemQty(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        {item.image && (
                          <Image src={item.image} alt={item.name} width={40} height={40} className="size-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-brand-orange font-medium">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {qty > 0 && (
                            <button
                              type="button"
                              onClick={() => updatePreOrder(item.id, item.name, item.price, -1)}
                              className="flex items-center justify-center size-7 rounded-md border border-border/60 text-foreground hover:bg-muted/80"
                            >
                              <Minus className="size-3" />
                            </button>
                          )}
                          {qty > 0 && (
                            <span className="text-sm font-bold w-5 text-center">{qty}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => updatePreOrder(item.id, item.name, item.price, 1)}
                            className="flex items-center justify-center size-7 rounded-md border border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preOrderTotal > 0 && (
        <div className="sticky bottom-0 bg-white pt-3 border-t border-border/40">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-brand-orange/5">
            <span className="text-sm font-medium text-foreground">Estimated meal cost</span>
            <span className="text-sm font-bold text-brand-orange">{formatPrice(preOrderTotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────

function StepReview({ restaurant, date, time, guestCount, occasion, preferences, preOrderItems, preOrderTotal, termsAccepted, setTermsAccepted }: {
  restaurant: RestaurantWithDetails;
  date: string; time: string; guestCount: number;
  occasion: string; preferences: string;
  preOrderItems: PreOrderItem[]; preOrderTotal: number;
  termsAccepted: boolean; setTermsAccepted: (v: boolean) => void;
}) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">Review Your Reservation</h3>

      <div className="space-y-3 text-sm">
        <Row label="Restaurant" value={restaurant.name} />
        <Row label="Date" value={formatted} />
        <Row label="Time" value={time} />
        <Row label="Guests" value={`${guestCount} guest${guestCount !== 1 ? "s" : ""}`} />
        {occasion !== "None" && <Row label="Occasion" value={occasion} />}
        {preferences && <Row label="Requests" value={preferences} />}
      </div>

      {preOrderItems.length > 0 && (
        <div className="border-t border-border/40 pt-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Pre-selected meals</p>
          {preOrderItems.map((item) => (
            <div key={item.menuItemId} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
              <span className="text-foreground font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-border/30">
            <span>Estimated total</span>
            <span className="text-brand-orange">{formatPrice(preOrderTotal)}</span>
          </div>
        </div>
      )}

      <div className="px-3 py-3 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-xs text-amber-800">
          A booking fee of <strong>500 FCFA</strong> will be required after the restaurant confirms your reservation.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <button
          type="button"
          onClick={() => setTermsAccepted(!termsAccepted)}
          className={`mt-0.5 size-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
            termsAccepted ? "bg-brand-orange border-brand-orange" : "border-border"
          }`}
        >
          {termsAccepted && <Check className="size-3 text-white" />}
        </button>
        <span className="text-xs text-muted-foreground">
          I understand that a booking fee is required to confirm my reservation and that the restaurant has 15 minutes to respond.
        </span>
      </label>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

// ─── Confirmation ────────────────────────────────────────────────────────────

function ConfirmationScreen({ reservation, restaurantName, onViewReservations }: {
  reservation: Reservation;
  restaurantName: string;
  onViewReservations: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4 animate-in zoom-in duration-500">
        <CheckCircle2 className="size-8 text-emerald-600" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">Reservation Request Sent!</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Your request to <span className="font-medium text-foreground">{restaurantName}</span> has been submitted. They have 15 minutes to respond.
      </p>

      {reservation.responseDeadline && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700 mb-1.5">Time remaining for restaurant to respond</p>
          <CountdownTimer
            deadline={reservation.responseDeadline}
            className="text-lg"
            onExpire={() => toast.info("The restaurant didn't respond in time. Your reservation has been cancelled.")}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-8">We&apos;ll notify you as soon as they respond.</p>

      <button
        onClick={onViewReservations}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
      >
        View My Reservations
      </button>
    </div>
  );
}
