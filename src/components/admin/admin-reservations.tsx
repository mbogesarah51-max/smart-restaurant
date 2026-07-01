"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CalendarCheck, Users, Clock, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAdminReservations, deleteReservation } from "@/app/actions/admin";
import {
  AdminPageHeader,
  FilterTabs,
  SearchBox,
  SectionCard,
  EmptyState,
  ConfirmDialog,
  ReservationStatusPill,
} from "@/components/admin/admin-kit";

const TABS = [
  { value: "all", label: "All" },
  { value: "AWAITING_RESPONSE", label: "Awaiting" },
  { value: "PAYMENT_PENDING", label: "Payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

type Row = {
  id: string;
  date: Date;
  time: string;
  guestCount: number;
  status: string;
  bookingFee: number | null;
  createdAt: Date;
  user: { id: string; name: string; email: string; phone: string };
  restaurant: { id: string; name: string; city: string };
};

export function AdminReservationsPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>(searchParams.get("status") || "all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getAdminReservations({ status, search: debouncedSearch.trim() || undefined }).then((result) => {
      if (cancelled || !result) return;
      setRows(result.reservations as unknown as Row[]);
      setTotal(result.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [status, debouncedSearch, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteReservation(deleteTarget.id);
    setDeleting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reservations" subtitle="Every booking across the platform." icon={CalendarCheck} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs tabs={TABS} value={status} onChange={setStatus} />
        <SearchBox value={search} onChange={setSearch} placeholder="Search restaurant or guest…" />
      </div>

      <SectionCard bodyClassName="p-0">
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No reservations found" hint="Try a different filter or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-brand-sand/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Restaurant</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Party</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Fee</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-black/[0.04] transition-colors last:border-0 hover:bg-brand-orange/[0.03]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-brand-dark">{r.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.user.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <p className="text-brand-dark">{r.restaurant.name}</p>
                      <p className="text-xs text-muted-foreground">{r.restaurant.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-brand-dark">{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {r.time}</p>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-muted-foreground"><Users className="size-3.5" /> {r.guestCount}</span>
                    </td>
                    <td className="hidden px-4 py-3 tabular-nums text-muted-foreground md:table-cell">
                      {r.bookingFee ? formatPrice(r.bookingFee) : "—"}
                    </td>
                    <td className="px-4 py-3"><ReservationStatusPill status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setDeleteTarget(r)}
                          title="Delete reservation"
                          className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
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
        {total} reservation{total !== 1 ? "s" : ""} total
      </p>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete reservation?"
        description={
          <>
            This permanently removes {deleteTarget?.user.name}&rsquo;s reservation at{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.restaurant.name}</span>. This cannot be undone.
          </>
        }
        confirmLabel="Delete reservation"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
