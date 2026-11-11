import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getRouteOccupancyMetrics, getBusOccupancyMetrics } from "@/services/report.service";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([Role.ADMIN, Role.OPERATOR]);
    const [routeOccupancy, busOccupancy] = await Promise.all([
      getRouteOccupancyMetrics(),
      getBusOccupancyMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        routes: routeOccupancy,
        buses: busOccupancy,
      },
    });
  } catch (error) {
    console.error("Occupancy metrics error:", error);
    return NextResponse.json({ success: false, error: "Unauthorized or failed to fetch occupancy" }, { status: 403 });
  }
}

