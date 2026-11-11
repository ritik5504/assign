import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bus: { include: { operator: true } },
        route: {
          include: {
            routeStops: {
              include: { stop: true },
              orderBy: { stopOrder: "asc" },
            },
          },
        },
        tripSeats: {
          include: { seat: true },
          orderBy: [{ seat: { row: "asc" } }, { seat: { column: "asc" } }],
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error) {
    console.error("Fetch trip error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trip" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([Role.ADMIN, Role.OPERATOR]);
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        status: body.status,
        baseFare: body.baseFare ? parseFloat(body.baseFare) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "TRIP_UPDATED",
        entityType: "TRIP",
        entityId: id,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update trip error:", error);
    return NextResponse.json({ success: false, error: "Failed to update trip" }, { status: 500 });
  }
}
