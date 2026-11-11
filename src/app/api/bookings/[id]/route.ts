import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        trip: {
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
          },
        },
        passengers: true,
        bookingSeats: {
          include: {
            tripSeat: { include: { seat: true } },
          },
        },
        cancellation: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Ownership check: Customer cannot view another person's booking
    if (session.role === "CUSTOMER" && booking.userId !== session.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Fetch booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

