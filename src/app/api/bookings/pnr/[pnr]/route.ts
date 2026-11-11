import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const { pnr } = await params;

    const booking = await prisma.booking.findUnique({
      where: { pnr: pnr.trim().toUpperCase() },
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
      return NextResponse.json({ success: false, error: "Booking with this PNR not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Fetch PNR error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch PNR ticket" },
      { status: 500 }
    );
  }
}
