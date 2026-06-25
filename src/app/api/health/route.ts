import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [restaurants, menuItems] = await Promise.all([
      prisma.restaurant.count({ where: { isApproved: true, isActive: true } }),
      prisma.menuItem.count({ where: { isAvailable: true } }),
    ]);

    return NextResponse.json({
      status: "ok",
      application: "ChopWise",
      database: "connected",
      restaurants,
      menuItems,
      currency: "FCFA",
      isoCurrency: "XAF",
      responseTimeMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Health] Database check failed", error);
    return NextResponse.json(
      {
        status: "degraded",
        application: "ChopWise",
        database: "unavailable",
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
