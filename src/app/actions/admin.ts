"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const admin = await requireAdmin();
  if (!admin) return null;

  const TREND_DAYS = 14;
  const now = new Date();
  const trendStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (TREND_DAYS - 1));

  const [
    totalUsers,
    clientCount,
    ownerCount,
    adminCount,
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    totalReservations,
    confirmedReservations,
    revenueAgg,
    recentReservations,
    recentUsers,
    pendingRestaurantsList,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "RESTAURANT_OWNER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { isApproved: true } }),
    prisma.restaurant.count({ where: { isApproved: false, isActive: true } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.reservation.aggregate({ _sum: { bookingFee: true }, where: { status: "CONFIRMED" } }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: trendStart } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.restaurant.findMany({
      where: { isApproved: false, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        owner: { select: { name: true, email: true } },
      },
    }),
  ]);

  const trend = bucketByDay(recentReservations.map((r) => r.createdAt), trendStart, TREND_DAYS)
    .map((b) => b.count);

  return {
    totalUsers,
    clientCount,
    ownerCount,
    adminCount,
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    totalReservations,
    confirmedReservations,
    totalRevenue: revenueAgg._sum.bookingFee ?? 0,
    trend,
    recentUsers,
    pendingRestaurantsList,
  };
}

// Bucket a list of dates into `days` consecutive daily counts starting at `start` (local midnight).
function bucketByDay(dates: Date[], start: Date, days: number) {
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const buckets: { date: Date; label: string; count: number }[] = [];
  const index = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    index.set(key(d), i);
    buckets.push({
      date: d,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  for (const d of dates) {
    const i = index.get(key(new Date(d)));
    if (i !== undefined) buckets[i].count++;
  }
  return buckets;
}

// ─── Restaurant Management ───────────────────────────────────────────────────

export async function getAdminRestaurants(filters: {
  status?: "pending" | "approved" | "suspended" | "all";
  search?: string;
  page?: number;
  limit?: number;
}) {
  const admin = await requireAdmin();
  if (!admin) return null;

  const { status = "all", search, page = 1, limit = 20 } = filters;

  const where: Record<string, unknown> = {};

  if (status === "pending") {
    where.isApproved = false;
    where.isActive = true;
  } else if (status === "approved") {
    where.isApproved = true;
    where.isActive = true;
  } else if (status === "suspended") {
    where.isActive = false;
  }

  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { city: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { menuItems: true, reservations: true } },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return { restaurants, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getAdminRestaurantDetail(restaurantId: string) {
  const admin = await requireAdmin();
  if (!admin) return null;

  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, profileImage: true } },
      menuItems: { orderBy: { category: "asc" } },
      availabilitySlots: { orderBy: { dayOfWeek: "asc" } },
    },
  });
}

export async function approveRestaurant(restaurantId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };

  try {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isApproved: true, isActive: true },
    });
    return { success: true, message: "Restaurant approved" };
  } catch {
    return { success: false, message: "Failed to approve restaurant" };
  }
}

export async function rejectRestaurant(restaurantId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };

  try {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isApproved: false, isActive: false },
    });
    return { success: true, message: "Restaurant rejected" };
  } catch {
    return { success: false, message: "Failed to reject restaurant" };
  }
}

export async function suspendRestaurant(restaurantId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };

  try {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive: false },
    });
    return { success: true, message: "Restaurant suspended" };
  } catch {
    return { success: false, message: "Failed to suspend restaurant" };
  }
}

export async function activateRestaurant(restaurantId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };

  try {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive: true },
    });
    return { success: true, message: "Restaurant activated" };
  } catch {
    return { success: false, message: "Failed to activate restaurant" };
  }
}

// ─── User Management ─────────────────────────────────────────────────────────

export async function getAdminUsers(filters: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const admin = await requireAdmin();
  if (!admin) return null;

  const { role, search, page = 1, limit = 20 } = filters;

  const where: Record<string, unknown> = {};

  if (role && role !== "all") {
    where.role = role;
  }

  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { email: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isActive: true, createdAt: true, profileImage: true,
        _count: { select: { restaurants: true, reservations: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function suspendUser(userId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };
  if (admin.id === userId) return { success: false, message: "Cannot suspend yourself" };

  try {
    await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
    return { success: true, message: "User suspended" };
  } catch {
    return { success: false, message: "Failed to suspend user" };
  }
}

export async function activateUser(userId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };

  try {
    await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
    return { success: true, message: "User activated" };
  } catch {
    return { success: false, message: "Failed to activate user" };
  }
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };
  if (admin.id === userId) return { success: false, message: "You cannot delete your own account" };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { clerkId: true } });
  if (!target) return { success: false, message: "User not found" };

  try {
    // Cascades to their restaurants, menu items and reservations (schema onDelete: Cascade)
    await prisma.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error("[deleteUser] DB delete failed:", error);
    return { success: false, message: "Failed to delete user" };
  }

  // Best-effort: remove the linked Clerk account so they can no longer sign in.
  if (target.clerkId) {
    try {
      await clerkClient.users.deleteUser(target.clerkId);
    } catch (error) {
      console.error("[deleteUser] Clerk delete failed (local row already removed):", error);
    }
  }

  return { success: true, message: "User permanently deleted" };
}

// ─── Reservations (platform-wide) ────────────────────────────────────────────

export async function getAdminReservations(filters: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const admin = await requireAdmin();
  if (!admin) return null;

  const { status = "all", search, page = 1, limit = 20 } = filters;
  const where: Record<string, unknown> = {};

  if (status && status !== "all") {
    if (status === "cancelled") where.status = { in: ["CANCELLED", "REJECTED"] };
    else where.status = status;
  }
  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { restaurant: { name: { contains: q, mode: "insensitive" } } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        restaurant: { select: { id: true, name: true, city: true } },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  return { reservations, total, page, totalPages: Math.ceil(total / limit) };
}

export async function deleteReservation(reservationId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };
  try {
    await prisma.reservation.delete({ where: { id: reservationId } });
    return { success: true, message: "Reservation deleted" };
  } catch (error) {
    console.error("[deleteReservation] failed:", error);
    return { success: false, message: "Failed to delete reservation" };
  }
}

export async function deleteRestaurant(restaurantId: string): Promise<ActionResponse> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, message: "Not authorized" };
  try {
    // Cascades to menu items, reservations and availability slots
    await prisma.restaurant.delete({ where: { id: restaurantId } });
    return { success: true, message: "Restaurant permanently deleted" };
  } catch (error) {
    console.error("[deleteRestaurant] failed:", error);
    return { success: false, message: "Failed to delete restaurant" };
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAdminAnalytics() {
  const admin = await requireAdmin();
  if (!admin) return null;

  const DAYS = 30;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS - 1));

  const [
    totalUsers,
    totalRestaurants,
    approvedRestaurants,
    totalReservations,
    confirmedCount,
    cancelledCount,
    revenueAgg,
    partyAgg,
    statusGroups,
    roleGroups,
    recentReservations,
    recentUsers,
    topRestaurants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { isApproved: true, isActive: true } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.reservation.count({ where: { status: { in: ["CANCELLED", "REJECTED"] } } }),
    prisma.reservation.aggregate({ _sum: { bookingFee: true }, where: { status: "CONFIRMED" } }),
    prisma.reservation.aggregate({ _avg: { guestCount: true } }),
    prisma.reservation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, status: true, bookingFee: true },
    }),
    prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.restaurant.findMany({
      take: 6,
      orderBy: { reservations: { _count: "desc" } },
      select: { id: true, name: true, city: true, _count: { select: { reservations: true } } },
    }),
  ]);

  // Daily reservation counts + confirmed revenue over the window
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const dayIndex = new Map<string, number>();
  const reservationsByDay: { label: string; reservations: number; revenue: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    dayIndex.set(dayKey(d), i);
    reservationsByDay.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      reservations: 0,
      revenue: 0,
    });
  }
  for (const r of recentReservations) {
    const i = dayIndex.get(dayKey(new Date(r.createdAt)));
    if (i === undefined) continue;
    reservationsByDay[i].reservations++;
    if (r.status === "CONFIRMED") reservationsByDay[i].revenue += r.bookingFee ?? 0;
  }

  const usersByDay = bucketByDay(recentUsers.map((u) => u.createdAt), start, DAYS)
    .map((b) => ({ label: b.label, count: b.count }));

  return {
    kpis: {
      totalRevenue: revenueAgg._sum.bookingFee ?? 0,
      totalReservations,
      confirmedCount,
      cancelledCount,
      conversionRate: totalReservations ? Math.round((confirmedCount / totalReservations) * 100) : 0,
      avgPartySize: partyAgg._avg.guestCount ? Math.round(partyAgg._avg.guestCount * 10) / 10 : 0,
      totalUsers,
      totalRestaurants,
      approvedRestaurants,
      newUsers30d: recentUsers.length,
      newReservations30d: recentReservations.length,
    },
    reservationsByDay,
    usersByDay,
    statusBreakdown: statusGroups.map((g) => ({ status: g.status as string, count: g._count._all })),
    roleBreakdown: roleGroups.map((g) => ({ role: g.role as string, count: g._count._all })),
    topRestaurants: topRestaurants.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      reservations: r._count.reservations,
    })),
  };
}
