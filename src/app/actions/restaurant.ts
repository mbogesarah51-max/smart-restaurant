"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import type { ActionResponse, RestaurantWithDetails } from "@/types";
import type { Restaurant } from "@/generated/prisma/client";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = generateSlug(base);
  if (!slug) slug = "restaurant";
  let existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (!existing) return slug;
  let i = 2;
  while (existing) {
    const candidate = `${slug}-${i}`;
    existing = await prisma.restaurant.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    i++;
  }
  return slug;
}

export async function getRestaurantByOwnerId(): Promise<RestaurantWithDetails | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;

  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
    include: {
      owner: true,
      menuItems: { orderBy: { createdAt: "desc" } },
      availabilitySlots: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!restaurant) return null;

  // Strip passwordHash from owner
  const { passwordHash: _, ...safeOwner } = restaurant.owner;
  return { ...restaurant, owner: safeOwner } as RestaurantWithDetails;
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantWithDetails | null> {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      owner: true,
      menuItems: { where: { isAvailable: true }, orderBy: { category: "asc" } },
      availabilitySlots: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!restaurant) return null;

  const { passwordHash: _, ...safeOwner } = restaurant.owner;
  return { ...restaurant, owner: safeOwner } as RestaurantWithDetails;
}

interface CreateRestaurantInput {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  priceRange: "BUDGET" | "MODERATE" | "PREMIUM" | "LUXURY";
  bannerImage?: string;
  galleryImages?: string[];
  description?: string;
  amenities?: string[];
  availability?: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isActive: boolean;
  }[];
}

export async function createRestaurant(
  input: CreateRestaurantInput
): Promise<ActionResponse<Restaurant>> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };
  if (user.role !== "RESTAURANT_OWNER") return { success: false, message: "Not authorized" };

  // Check if owner already has a restaurant
  const existing = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
  if (existing) return { success: false, message: "You already have a restaurant registered" };

  // Validate required fields
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, message: "Restaurant name is required", errors: { name: ["Name must be at least 2 characters"] } };
  }
  if (!input.phone || input.phone.trim().length < 9) {
    return { success: false, message: "Phone number is required", errors: { phone: ["Valid phone number is required"] } };
  }
  if (!input.address || input.address.trim().length < 5) {
    return { success: false, message: "Address is required", errors: { address: ["Address must be at least 5 characters"] } };
  }
  if (!input.city) {
    return { success: false, message: "City is required", errors: { city: ["Please select a city"] } };
  }

  try {
    const slug = await uniqueSlug(input.name);

    const restaurant = await prisma.$transaction(async (tx) => {
      const rest = await tx.restaurant.create({
        data: {
          ownerId: user.id,
          name: input.name.trim(),
          slug,
          phone: input.phone.trim(),
          whatsapp: input.whatsapp?.trim() || input.phone.trim(),
          email: input.email?.trim() || undefined,
          address: input.address.trim(),
          city: input.city,
          latitude: input.latitude,
          longitude: input.longitude,
          priceRange: input.priceRange,
          bannerImage: input.bannerImage,
          galleryImages: input.galleryImages || [],
          description: input.description?.trim(),
          amenities: input.amenities || [],
          isApproved: false,
          isActive: true,
        },
      });

      // Create availability slots
      if (input.availability && input.availability.length > 0) {
        await tx.availabilitySlot.createMany({
          data: input.availability.map((slot) => ({
            restaurantId: rest.id,
            dayOfWeek: slot.dayOfWeek,
            openTime: slot.openTime,
            closeTime: slot.closeTime,
            isActive: slot.isActive,
          })),
        });
      }

      return rest;
    });

    return {
      success: true,
      message: "Restaurant submitted for approval!",
      data: restaurant,
    };
  } catch (error) {
    console.error("Create restaurant error:", error);
    return { success: false, message: "Failed to create restaurant. Please try again." };
  }
}

export async function updateRestaurant(
  restaurantId: string,
  input: Partial<CreateRestaurantInput>
): Promise<ActionResponse<Restaurant>> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant || restaurant.ownerId !== user.id) {
    return { success: false, message: "Restaurant not found" };
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
      if (input.name.trim() !== restaurant.name) {
        updateData.slug = await uniqueSlug(input.name);
      }
    }
    if (input.phone !== undefined) updateData.phone = input.phone.trim();
    if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp.trim();
    if (input.email !== undefined) updateData.email = input.email.trim() || null;
    if (input.address !== undefined) updateData.address = input.address.trim();
    if (input.city !== undefined) updateData.city = input.city;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.priceRange !== undefined) updateData.priceRange = input.priceRange;
    if (input.bannerImage !== undefined) updateData.bannerImage = input.bannerImage;
    if (input.galleryImages !== undefined) updateData.galleryImages = input.galleryImages;
    if (input.description !== undefined) updateData.description = input.description.trim();
    if (input.amenities !== undefined) updateData.amenities = input.amenities;

    const updated = await prisma.$transaction(async (tx) => {
      const rest = await tx.restaurant.update({
        where: { id: restaurantId },
        data: updateData,
      });

      // Update availability if provided
      if (input.availability) {
        await tx.availabilitySlot.deleteMany({ where: { restaurantId } });
        if (input.availability.length > 0) {
          await tx.availabilitySlot.createMany({
            data: input.availability.map((slot) => ({
              restaurantId,
              dayOfWeek: slot.dayOfWeek,
              openTime: slot.openTime,
              closeTime: slot.closeTime,
              isActive: slot.isActive,
            })),
          });
        }
      }

      return rest;
    });

    return { success: true, message: "Restaurant updated successfully", data: updated };
  } catch (error) {
    console.error("Update restaurant error:", error);
    return { success: false, message: "Failed to update restaurant" };
  }
}

// ─── Search / Discovery ──────────────────────────────────────────────────────

export interface SearchParams {
  query?: string;
  priceRange?: string[];
  city?: string;
  amenities?: string[];
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  restaurants: (Restaurant & { menuItems: { id: string }[]; availabilitySlots: { dayOfWeek: number; openTime: string; closeTime: string; isActive: boolean }[] })[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchRestaurants(params: SearchParams): Promise<SearchResult> {
  const {
    query,
    priceRange,
    city,
    amenities,
    sort = "newest",
    page = 1,
    limit = 12,
  } = params;

  const where: Record<string, unknown> = {
    isApproved: true,
    isActive: true,
  };

  // Text search on name and description
  if (query && query.trim()) {
    where.OR = [
      { name: { contains: query.trim(), mode: "insensitive" } },
      { description: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  // Price range filter (any of selected)
  if (priceRange && priceRange.length > 0) {
    where.priceRange = { in: priceRange };
  }

  // City filter
  if (city && city.trim()) {
    where.city = city.trim();
  }

  // Amenities filter (must have ALL selected)
  if (amenities && amenities.length > 0) {
    where.amenities = { hasEvery: amenities };
  }

  // Sort
  let orderBy: Record<string, string>;
  switch (sort) {
    case "price_asc":
      orderBy = { priceRange: "asc" };
      break;
    case "price_desc":
      orderBy = { priceRange: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        menuItems: { select: { id: true }, where: { isAvailable: true } },
        availabilitySlots: {
          where: { isActive: true },
          select: { dayOfWeek: true, openTime: true, closeTime: true, isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    restaurants,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
