"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search,
  Store,
  ArrowRight,
  Loader2,
  Check,
  X,
  Ban,
  RotateCcw,
  UtensilsCrossed,
} from "lucide-react";
import {
  getAdminRestaurants,
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  activateRestaurant,
} from "@/app/actions/admin";

type Tab = "pending" | "approved" | "suspended" | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "suspended", label: "Suspended" },
  { value: "all", label: "All" },
];

type RestaurantRow = {
  id: string;
  name: string;
  city: string;
  priceRange: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  owner: { id: string; name: string; email: string; phone: string };
  _count: { menuItems: number; reservations: number };
};

const PRICE_ICONS: Record<string, string> = {
  BUDGET: "$", MODERATE: "$$", PREMIUM: "$$$", LUXURY: "$$$$",
};

export function AdminRestaurantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialTab = (searchParams.get("status") as Tab) || "pending";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getAdminRestaurants({ status: tab, search: search.trim() || undefined });
    if (result) {
      setRestaurants(result.restaurants as unknown as RestaurantRow[]);
      setTotal(result.total);
    }
    // Also get pending count for badge
    const pendingResult = await getAdminRestaurants({ status: "pending", limit: 1 });
    if (pendingResult) setPendingCount(pendingResult.total);
    setLoading(false);
  }, [tab, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/dashboard/admin/restaurants?status=${t}`, { scroll: false });
  }

  function getStatusBadge(r: RestaurantRow) {
    if (!r.isActive) return <Badge variant="destructive" className="text-[10px]">Suspended</Badge>;
    if (r.isApproved) return <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-0">Approved</Badge>;
    return <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">Pending</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">Restaurants</h1>
        <p className="text-sm text-muted-foreground">Manage restaurant listings and approvals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => switchTab(t.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.value
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {t.label}
            {t.value === "pending" && pendingCount > 0 && (
              <span className={`text-[10px] px-1.5 py-px rounded-full ${tab === "pending" ? "bg-white/20" : "bg-amber-100 text-amber-700"}`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city..."
          className="pl-9 h-9 rounded-lg"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : restaurants.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                <UtensilsCrossed className="size-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">No restaurants found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Restaurant</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">City</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{r.owner.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-foreground">{r.owner.name}</p>
                      <p className="text-xs text-muted-foreground">{r.owner.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{r.city}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell font-medium">{PRICE_ICONS[r.priceRange]}</td>
                    <td className="px-4 py-3">{getStatusBadge(r)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/admin/restaurants/${r.id}`}
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-brand-orange hover:bg-brand-orange/10 transition-colors"
                        >
                          Review
                        </Link>
                        <QuickActions restaurant={r} onDone={fetchData} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">{total} restaurant{total !== 1 ? "s" : ""} total</p>
    </div>
  );
}

function QuickActions({ restaurant: r, onDone }: { restaurant: RestaurantRow; onDone: () => void }) {
  const [acting, setActing] = useState(false);

  async function act(action: () => Promise<{ success: boolean; message: string }>) {
    setActing(true);
    const result = await action();
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setActing(false);
    onDone();
  }

  if (acting) return <Loader2 className="size-4 animate-spin text-muted-foreground mx-2" />;

  return (
    <>
      {/* Pending → Approve / Reject */}
      {!r.isApproved && r.isActive && (
        <>
          <button onClick={() => act(() => approveRestaurant(r.id))} className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
            <Check className="size-3.5" />
          </button>
          <button onClick={() => act(() => rejectRestaurant(r.id))} className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors" title="Reject">
            <X className="size-3.5" />
          </button>
        </>
      )}
      {/* Approved → Suspend */}
      {r.isApproved && r.isActive && (
        <button onClick={() => act(() => suspendRestaurant(r.id))} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Suspend">
          <Ban className="size-3.5" />
        </button>
      )}
      {/* Suspended → Reactivate */}
      {!r.isActive && (
        <button onClick={() => act(() => activateRestaurant(r.id))} className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Reactivate">
          <RotateCcw className="size-3.5" />
        </button>
      )}
    </>
  );
}
