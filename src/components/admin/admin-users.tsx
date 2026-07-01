"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Users, Ban, RotateCcw, Trash2, Store, CalendarCheck, ShieldCheck } from "lucide-react";
import { getAdminUsers, suspendUser, activateUser, deleteUser } from "@/app/actions/admin";
import {
  AdminPageHeader,
  FilterTabs,
  SearchBox,
  SectionCard,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/admin-kit";

const ROLE_FILTERS = [
  { value: "all", label: "All" },
  { value: "CLIENT", label: "Diners" },
  { value: "RESTAURANT_OWNER", label: "Owners" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  RESTAURANT_OWNER: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-violet-100 text-violet-700",
};
const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Diner",
  RESTAURANT_OWNER: "Owner",
  ADMIN: "Admin",
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  profileImage: string | null;
  _count: { restaurants: number; reservations: number };
};

export function AdminUsersPage({ currentUserId }: { currentUserId: string }) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search (setState in timeout callback → no synchronous effect setState)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getAdminUsers({
      role: roleFilter !== "all" ? roleFilter : undefined,
      search: debouncedSearch.trim() || undefined,
    }).then((result) => {
      if (cancelled || !result) return;
      setUsers(result.users as unknown as UserRow[]);
      setTotal(result.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [roleFilter, debouncedSearch, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  async function toggleUser(u: UserRow) {
    setBusyId(u.id);
    const result = u.isActive ? await suspendUser(u.id) : await activateUser(u.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setBusyId(null);
    refetch();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteUser(deleteTarget.id);
    setDeleting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Users" subtitle="Manage every account on the platform." icon={Users} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs tabs={ROLE_FILTERS} value={roleFilter} onChange={setRoleFilter} />
        <SearchBox value={search} onChange={setSearch} placeholder="Search name or email…" />
      </div>

      <SectionCard bodyClassName="p-0">
        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" hint="Try a different filter or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-brand-sand/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Phone</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Activity</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr key={u.id} className="border-b border-black/[0.04] transition-colors last:border-0 hover:bg-brand-orange/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/90 to-amber-500 text-[11px] font-bold text-white">
                            {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-medium text-brand-dark">
                              {u.name}
                              {isSelf && <span className="rounded bg-brand-orange/10 px-1.5 py-px text-[9px] font-semibold text-brand-orange">YOU</span>}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground tabular-nums sm:table-cell">{u.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role]}`}>
                          {u.role === "ADMIN" && <ShieldCheck className="size-3" />}
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><Store className="size-3" /> {u._count.restaurants}</span>
                          <span className="inline-flex items-center gap-1"><CalendarCheck className="size-3" /> {u._count.reservations}</span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {u.isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {busyId === u.id ? (
                            <Loader2 className="mx-2 size-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {!isSelf && (
                                <button
                                  onClick={() => toggleUser(u)}
                                  title={u.isActive ? "Suspend" : "Activate"}
                                  className={`cursor-pointer rounded-lg p-1.5 transition-colors ${u.isActive ? "text-muted-foreground hover:bg-amber-50 hover:text-amber-600" : "text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600"}`}
                                >
                                  {u.isActive ? <Ban className="size-4" /> : <RotateCcw className="size-4" />}
                                </button>
                              )}
                              {!isSelf && (
                                <button
                                  onClick={() => setDeleteTarget(u)}
                                  title="Delete"
                                  className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <p className="text-center text-xs text-muted-foreground tabular-nums">
        {total} user{total !== 1 ? "s" : ""} total
      </p>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete user?"
        description={
          <>
            This permanently deletes <span className="font-semibold text-foreground">{deleteTarget?.name}</span> and all of their data
            {deleteTarget && (deleteTarget._count.restaurants > 0 || deleteTarget._count.reservations > 0) ? (
              <> — including {deleteTarget._count.restaurants} restaurant{deleteTarget._count.restaurants !== 1 ? "s" : ""} and {deleteTarget._count.reservations} reservation{deleteTarget._count.reservations !== 1 ? "s" : ""}</>
            ) : null}
            . This cannot be undone.
          </>
        }
        confirmLabel="Delete user"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
