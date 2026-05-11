"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { menuItemSchema } from "@/lib/validations";
import type { ActionResponse } from "@/types";
import type { MenuItem } from "@/generated/prisma/client";

async function getOwnerRestaurantId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  return restaurant?.id ?? null;
}

export async function getMenuByRestaurantId(restaurantId: string) {
  const items = await prisma.menuItem.findMany({
    where: { restaurantId },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  const grouped = {
    FOOD: items.filter((i) => i.category === "FOOD"),
    DRINK: items.filter((i) => i.category === "DRINK"),
    DESSERT: items.filter((i) => i.category === "DESSERT"),
    OTHER: items.filter((i) => i.category === "OTHER"),
  };

  return { items, grouped };
}

export async function addMenuItem(
  data: {
    name: string;
    description?: string;
    price: number;
    category: "FOOD" | "DRINK" | "DESSERT" | "OTHER";
    image?: string;
  }
): Promise<ActionResponse<MenuItem>> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const validated = menuItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: validated.data.name,
        description: validated.data.description || null,
        price: validated.data.price,
        category: validated.data.category,
        image: validated.data.image || null,
        isAvailable: true,
      },
    });
    return { success: true, message: "Menu item added", data: item };
  } catch (error) {
    console.error("Add menu item error:", error);
    return { success: false, message: "Failed to add menu item" };
  }
}

export async function updateMenuItem(
  itemId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: "FOOD" | "DRINK" | "DESSERT" | "OTHER";
    image?: string;
  }
): Promise<ActionResponse<MenuItem>> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item || item.restaurantId !== restaurantId) {
    return { success: false, message: "Menu item not found" };
  }

  try {
    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name: data.name?.trim(),
        description: data.description?.trim() || null,
        price: data.price,
        category: data.category,
        image: data.image ?? item.image,
      },
    });
    return { success: true, message: "Menu item updated", data: updated };
  } catch (error) {
    console.error("Update menu item error:", error);
    return { success: false, message: "Failed to update menu item" };
  }
}

export async function deleteMenuItem(itemId: string): Promise<ActionResponse> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item || item.restaurantId !== restaurantId) {
    return { success: false, message: "Menu item not found" };
  }

  try {
    await prisma.menuItem.delete({ where: { id: itemId } });
    return { success: true, message: "Menu item deleted" };
  } catch (error) {
    console.error("Delete menu item error:", error);
    return { success: false, message: "Failed to delete menu item" };
  }
}

export async function toggleMenuItemAvailability(itemId: string): Promise<ActionResponse<MenuItem>> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
  if (!item || item.restaurantId !== restaurantId) {
    return { success: false, message: "Menu item not found" };
  }

  try {
    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable: !item.isAvailable },
    });
    return { success: true, message: updated.isAvailable ? "Item is now available" : "Item marked as unavailable", data: updated };
  } catch (error) {
    console.error("Toggle availability error:", error);
    return { success: false, message: "Failed to toggle availability" };
  }
}

export async function bulkToggleAvailability(available: boolean): Promise<ActionResponse> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  try {
    await prisma.menuItem.updateMany({
      where: { restaurantId },
      data: { isAvailable: available },
    });
    return { success: true, message: available ? "All items marked available" : "All items marked unavailable" };
  } catch (error) {
    console.error("Bulk toggle error:", error);
    return { success: false, message: "Failed to update items" };
  }
}
