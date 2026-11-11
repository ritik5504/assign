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
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        operator: true,
        seats: {
          orderBy: [{ row: "asc" }, { column: "asc" }],
        },
      },
    });

    if (!bus) {
      return NextResponse.json({ success: false, error: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: bus });
  } catch (error) {
    console.error("Fetch bus error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bus" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.bus.update({
      where: { id },
      data: {
        busName: body.busName,
        status: body.status,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "BUS_UPDATED",
        entityType: "BUS",
        entityId: id,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update bus error:", error);
    return NextResponse.json({ success: false, error: "Failed to update bus" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const { id } = await params;

    // Check if bus has scheduled trips
    const tripCount = await prisma.trip.count({
      where: { busId: id, status: "SCHEDULED" },
    });

    if (tripCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete bus with scheduled trips. Deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.bus.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "BUS_DELETED",
        entityType: "BUS",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Bus deleted successfully" });
  } catch (error) {
    console.error("Delete bus error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete bus" }, { status: 500 });
  }
}

