"use server";

import prisma from "@/lib/prisma";

export type LandingStats = {
  restaurants: number;
  reservations: number;
  diners: number;
  cities: number;
  cityNames: string[];
};

export async function getLandingStats(): Promise<LandingStats> {
  const approvedRestaurantFilter = { isApproved: true, isActive: true } as const;

  try {
    const [restaurants, reservations, diners, cityRows] = await Promise.all([
      prisma.restaurant.count({ where: approvedRestaurantFilter }),
      prisma.reservation.count(),
      prisma.user.count({ where: { role: "CLIENT", isActive: true } }),
      prisma.restaurant.findMany({
        where: approvedRestaurantFilter,
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
    ]);

    const cityNames = cityRows.map((row) => row.city.trim()).filter(Boolean);

    return {
      restaurants,
      reservations,
      diners,
      cities: cityNames.length,
      cityNames,
    };
  } catch (error) {
    console.error("[Landing] Unable to load live platform statistics:", error);
    return {
      restaurants: 0,
      reservations: 0,
      diners: 0,
      cities: 0,
      cityNames: [],
    };
  }
}
