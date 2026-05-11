"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  RotateCcw,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  UtensilsCrossed,
  Coffee,
  IceCream,
  MoreHorizontal,
  User,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  activateRestaurant,
} from "@/app/actions/admin";
import type { Restaurant, MenuItem, AvailabilitySlot } from "@/generated/prisma/client";

type ReviewRestaurant = Restaurant & {
  owner: { id: string; name: string; email: string; phone: string; role: string; createdAt: Date; profileImage: string | null };
  menuItems: MenuItem[];
  availabilitySlots: AvailabilitySlot[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const PRICE_ICONS: Record<string, string> = { BUDGET: "$", MODERATE: "$$", PREMIUM: "$$$", LUXURY: "$$$$" };
const MENU_SECTIONS = [
  { key: "FOOD" as const, label: "Food", icon: UtensilsCrossed },
  { key: "DRINK" as const, label: "Drinks", icon: Coffee },
  { key: "DESSERT" as const, label: "Desserts", icon: IceCream },
  { key: "OTHER" as const, label: "Other", icon: MoreHorizontal },
];

export function AdminRestaurantReview({ restaurant: r }: { restaurant: ReviewRestaurant }) {
  const router = useRouter();
  const [acting, setActing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject" | "suspend" | "activate") {
    setActing(true);
    let result;
    switch (action) {
      case "approve": result = await approveRestaurant(r.id); break;
      case "reject": result = await rejectRestaurant(r.id); break;
      case "suspend": result = await suspendRestaurant(r.id); break;
      case "activate": result = await activateRestaurant(r.id); break;
    }
    if (result.success) {
      toast.success(result.message);
      router.push("/dashboard/admin/restaurants");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setActing(false);
    setConfirmAction(null);
  }

  const isPending = !r.isApproved && r.isActive;
  const isSuspended = !r.isActive;
  const isApproved = r.isApproved && r.isActive;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/admin/restaurants"
          className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold font-heading text-foreground">{r.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{r.city}</span>
            {isPending && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">Pending Review</Badge>}
            {isApproved && <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-0">Approved</Badge>}
            {isSuspended && <Badge variant="destructive" className="text-[10px]">Suspended</Badge>}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <Card className={`shadow-sm ${isPending ? "border-amber-200 bg-amber-50/30" : "border-border/50"}`}>
        <CardContent className="pt-5 pb-5">
          {confirmAction ? (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-foreground flex-1">
                {confirmAction === "approve" ? "Approve this restaurant? It will become visible to diners." : "Reject this restaurant? It will be hidden from the platform."}
              </p>
              <button
                onClick={() => handleAction(confirmAction)}
                disabled={acting}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                  confirmAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"
                }`}
              >
                {acting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Confirm {confirmAction === "approve" ? "Approval" : "Rejection"}
              </button>
              <button onClick={() => setConfirmAction(null)} className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/80">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {isPending && (
                <>
                  <button onClick={() => setConfirmAction("approve")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                    <Check className="size-4" /> Approve
                  </button>
                  <button onClick={() => setConfirmAction("reject")} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-destructive hover:bg-destructive/90 text-white transition-colors">
                    <X className="size-4" /> Reject
                  </button>
                </>
              )}
              {isApproved && (
                <button onClick={() => handleAction("suspend")} disabled={acting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
                  <Ban className="size-4" /> Suspend
                </button>
              )}
              {isSuspended && (
                <button onClick={() => handleAction("activate")} disabled={acting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                  <RotateCcw className="size-4" /> Reactivate
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {r.bannerImage && (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <Image src={r.bannerImage} alt={r.name} width={800} height={300} className="w-full h-48 object-cover" />
            </div>
          )}
          {r.galleryImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {r.galleryImages.map((url, i) => (
                <Image key={i} src={url} alt={`Gallery ${i}`} width={160} height={100} className="w-32 h-20 rounded-lg object-cover shrink-0 border border-border/50" />
              ))}
            </div>
          )}

          {/* Description */}
          {r.description && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Description</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p></CardContent>
            </Card>
          )}

          {/* Menu */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Menu ({r.menuItems.length} items)</CardTitle></CardHeader>
            <CardContent>
              {r.menuItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No menu items added yet.</p>
              ) : (
                <div className="space-y-4">
                  {MENU_SECTIONS.map(({ key, label, icon: Icon }) => {
                    const items = r.menuItems.filter((i) => i.category === key);
                    if (!items.length) return null;
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon className="size-3.5 text-brand-orange" />
                          <span className="text-xs font-semibold text-foreground">{label}</span>
                        </div>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-2 py-1.5 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <span className={item.isAvailable ? "text-foreground" : "text-muted-foreground line-through"}>{item.name}</span>
                                {!item.isAvailable && <Badge variant="secondary" className="text-[9px] border-0 bg-muted">Unavailable</Badge>}
                              </div>
                              <span className="font-medium text-brand-orange">{formatPrice(item.price)}</span>
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

          {/* Schedule */}
          {r.availabilitySlots.length > 0 && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Opening Hours</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {r.availabilitySlots.map((s) => (
                    <div key={s.dayOfWeek} className="flex items-center justify-between text-sm py-1">
                      <span className={s.isActive ? "text-foreground" : "text-muted-foreground"}>{DAYS[s.dayOfWeek]}</span>
                      <span className={s.isActive ? "text-foreground" : "text-muted-foreground"}>
                        {s.isActive ? `${s.openTime} – ${s.closeTime}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Restaurant Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-muted-foreground" />
                <span>{r.address}, {r.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-muted-foreground" />
                <span>{r.phone}</span>
              </div>
              {r.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>{r.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Price:</span>
                <span className="font-medium">{PRICE_ICONS[r.priceRange]} {r.priceRange}</span>
              </div>
              {r.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {r.amenities.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-medium text-muted-foreground">{a}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                Submitted: {new Date(r.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Owner Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-heading">Owner</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 shrink-0">
                  {r.owner.profileImage ? (
                    <Image src={r.owner.profileImage} alt="" width={40} height={40} className="rounded-full object-cover" />
                  ) : (
                    <User className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.owner.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.owner.email}</p>
                  <p className="text-xs text-muted-foreground">{r.owner.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
