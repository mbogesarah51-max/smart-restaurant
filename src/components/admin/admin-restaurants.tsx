"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Store,
  Check,
  X,
  Ban,
  RotateCcw,
  Trash2,
  UtensilsCrossed,
  BookOpen,
  CalendarCheck,
  ExternalLink,
} from "lucide-react";
import {
  getAdminRestaurants,
  approveRestaurant,
  rejectRestaurant,
  suspendRestaurant,
  activateRestaurant,
  deleteRestaurant,
} from "@/app/actions/admin";
import {
  AdminPageHeader,
  FilterTabs,
  SearchBox,
  SectionCard,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/admin-kit";

type Tab = "pending" | "approved" | "suspended" | "all";

const TABS: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "suspended", label: "Suspended" },
  { value: "all", label: "All" },
];

const PRICE_ICONS: Record<string, string> = {
  BUDGET: "$", MODERATE: "$$", PREMIUM: "$$$", LUXURY: "$$$$",
};

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

export function AdminRestaurantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>((searchParams.get("status") as Tab) || "pending");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RestaurantRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getAdminRestaurants({ status: tab, search: debouncedSearch.trim() || undefined }),
      getAdminRestaurants({ status: "pending", limit: 1 }),
    ]).then(([res, pending]) => {
      if (cancelled) return;
      if (res) {
        setRestaurants(res.restaurants as unknown as RestaurantRow[]);
        setTotal(res.total);
      }
      if (pending) setPendingCount(pending.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedSearch, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  function switchTab(t: Tab) {
    setTab(t);
    router.replace(`/dashboard/admin/restaurants?status=${t}`, { scroll: false });
  }

  async function act(id: string, action: () => Promise<{ success: boolean; message: string }>) {
    setBusyId(id);
    const result = await action();
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setBusyId(null);
    refetch();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteRestaurant(deleteTarget.id);
    setDeleting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setDeleteTarget(null);
    refetch();
  }

  function statusPill(r: RestaurantRow) {
    if (!r.isActive) return <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">Suspended</span>;
    if (r.isApproved) return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Approved</span>;
    return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>;
  }

  const tabsWithCount = TABS.map((t) => (t.value === "pending" ? { ...t, count: pendingCount } : t));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Restaurants" subtitle="Approve, moderate and manage every listing." icon={UtensilsCrossed} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs tabs={tabsWithCount} value={tab} onChange={switchTab} />
        <SearchBox value={search} onChange={setSearch} placeholder="Search name or city…" />
      </div>

      <SectionCard bodyClassName="p-0">
        {loading && restaurants.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState icon={Store} title="No restaurants found" hint="Try a different filter or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-brand-sand/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Restaurant</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Owner</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">City</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Menu / Bookings</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((r) => (
                  <tr key={r.id} className="border-b border-black/[0.04] transition-colors last:border-0 hover:bg-brand-orange/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-brand-orange">
                          <Store className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-brand-dark">{r.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{r.owner.name} · {r.city}</p>
                          <p className="hidden text-xs text-muted-foreground sm:block">{PRICE_ICONS[r.priceRange]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="text-brand-dark">{r.owner.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.owner.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{r.city}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><BookOpen className="size-3" /> {r._count.menuItems}</span>
                        <span className="inline-flex items-center gap-1"><CalendarCheck className="size-3" /> {r._count.reservations}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusPill(r)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/admin/restaurants/${r.id}`}
                          className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-orange transition-colors hover:bg-brand-orange/10"
                        >
                          Review <ExternalLink className="size-3" />
                        </Link>
                        {busyId === r.id ? (
                          <Loader2 className="mx-2 size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            {!r.isApproved && r.isActive && (
                              <>
                                <button onClick={() => act(r.id, () => approveRestaurant(r.id))} title="Approve" className="cursor-pointer rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50">
                                  <Check className="size-4" />
                                </button>
                                <button onClick={() => act(r.id, () => rejectRestaurant(r.id))} title="Reject" className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600">
                                  <X className="size-4" />
                                </button>
                              </>
                            )}
                            {r.isApproved && r.isActive && (
                              <button onClick={() => act(r.id, () => suspendRestaurant(r.id))} title="Suspend" className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-amber-50 hover:text-amber-600">
                                <Ban className="size-4" />
                              </button>
                            )}
                            {!r.isActive && (
                              <button onClick={() => act(r.id, () => activateRestaurant(r.id))} title="Reactivate" className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                                <RotateCcw className="size-4" />
                              </button>
                            )}
                            <button onClick={() => setDeleteTarget(r)} title="Delete" className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                              <Trash2 className="size-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <p className="text-center text-xs text-muted-foreground tabular-nums">
        {total} restaurant{total !== 1 ? "s" : ""} total
      </p>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete restaurant?"
        description={
          <>
            This permanently deletes <span className="font-semibold text-foreground">{deleteTarget?.name}</span>, along with its
            {deleteTarget ? ` ${deleteTarget._count.menuItems} menu item${deleteTarget._count.menuItems !== 1 ? "s" : ""} and ${deleteTarget._count.reservations} reservation${deleteTarget._count.reservations !== 1 ? "s" : ""}` : ""}. This cannot be undone.
          </>
        }
        confirmLabel="Delete restaurant"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
