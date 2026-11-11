import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { routeSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        routeStops: {
          include: { stop: true },
          orderBy: { stopOrder: "asc" },
        },
        _count: {
          select: { trips: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: routes });
  } catch (error) {
    console.error("Fetch routes error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();

    const parsed = routeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { source, destination, distance, estimatedDuration, stops } = parsed.data;

    const route = await prisma.$transaction(async (tx) => {
      const createdRoute = await tx.route.create({
        data: { source, destination, distance, estimatedDuration },
      });

      if (stops && stops.length > 0) {
        await tx.routeStop.createMany({
          data: stops.map((s) => ({
            routeId: createdRoute.id,
            stopId: s.stopId,
            stopOrder: s.stopOrder,
            arrivalOffset: s.arrivalOffset,
            departureOffset: s.departureOffset,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "ROUTE_CREATED",
          entityType: "ROUTE",
          entityId: createdRoute.id,
          metadata: JSON.stringify({ source, destination, distance }),
        },
      });

      return createdRoute;
    });

    return NextResponse.json({ success: true, data: route }, { status: 201 });
  } catch (error) {
    console.error("Create route error:", error);
    return NextResponse.json({ success: false, error: "Failed to create route" }, { status: 500 });
  }
}

