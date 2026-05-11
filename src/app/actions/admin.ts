"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { ActionResponse } from "@/types";

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

  const [
    totalUsers,
    clientCount,
    ownerCount,
    adminCount,
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    totalReservations,
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

  return {
    totalUsers,
    clientCount,
    ownerCount,
    adminCount,
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    totalReservations,
    recentUsers,
    pendingRestaurantsList,
  };
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
