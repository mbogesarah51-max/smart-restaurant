"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Users,
  Ban,
  RotateCcw,
  X,
  Store,
  CalendarCheck,
} from "lucide-react";
import { getAdminUsers, suspendUser, activateUser } from "@/app/actions/admin";

const ROLE_FILTERS = [
  { value: "all", label: "All" },
  { value: "CLIENT", label: "Diners" },
  { value: "RESTAURANT_OWNER", label: "Owners" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  RESTAURANT_OWNER: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-purple-100 text-purple-700",
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

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getAdminUsers({ role: roleFilter !== "all" ? roleFilter : undefined, search: search.trim() || undefined });
    if (result) {
      setUsers(result.users as unknown as UserRow[]);
      setTotal(result.total);
    }
    setLoading(false);
  }, [roleFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleToggleUser(userId: string, isActive: boolean) {
    const result = isActive ? await suspendUser(userId) : await activateUser(userId);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    fetchData();
    if (selectedUser?.id === userId) setSelectedUser(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">Manage platform users</p>
      </div>

      {/* Role tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              roleFilter === f.value
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-9 h-9 rounded-lg"
        />
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="py-16">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                    <Users className="size-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">No users found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className={`border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${selectedUser?.id === u.id ? "bg-brand-orange/5" : ""}`}
                        onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.phone}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={`text-[10px] border-0 ${ROLE_COLORS[u.role]}`}>
                            {ROLE_LABELS[u.role] || u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {u.isActive ? (
                            <span className="text-xs text-emerald-600 font-medium">Active</span>
                          ) : (
                            <span className="text-xs text-destructive font-medium">Suspended</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {u.role !== "ADMIN" && (
                              u.isActive ? (
                                <button
                                  onClick={() => handleToggleUser(u.id, true)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Suspend"
                                >
                                  <Ban className="size-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleUser(u.id, false)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Activate"
                                >
                                  <RotateCcw className="size-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-3">{total} user{total !== 1 ? "s" : ""} total</p>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="hidden lg:block w-72 shrink-0">
            <Card className="border-border/50 shadow-sm sticky top-20">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">User Details</h3>
                  <button onClick={() => setSelectedUser(null)} className="p-1 rounded hover:bg-muted/80">
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex flex-col items-center text-center mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold text-lg mb-2">
                    {selectedUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  <Badge variant="secondary" className={`text-[10px] border-0 mt-1.5 ${ROLE_COLORS[selectedUser.role]}`}>
                    {ROLE_LABELS[selectedUser.role]}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm border-t border-border/40 pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{selectedUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={selectedUser.isActive ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
                      {selectedUser.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  {selectedUser.role === "RESTAURANT_OWNER" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Store className="size-3" /> Restaurants</span>
                      <span className="text-foreground">{selectedUser._count.restaurants}</span>
                    </div>
                  )}
                  {selectedUser.role === "CLIENT" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><CalendarCheck className="size-3" /> Reservations</span>
                      <span className="text-foreground">{selectedUser._count.reservations}</span>
                    </div>
                  )}
                </div>

                {selectedUser.role !== "ADMIN" && (
                  <div className="mt-4 pt-3 border-t border-border/40">
                    {selectedUser.isActive ? (
                      <button
                        onClick={() => handleToggleUser(selectedUser.id, true)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                      >
                        <Ban className="size-3.5" /> Suspend User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleUser(selectedUser.id, false)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <RotateCcw className="size-3.5" /> Activate User
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
