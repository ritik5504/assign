import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.OPERATOR]);
    const { tripId } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bus: true,
        route: true,
        bookings: {
          where: { status: "CONFIRMED" },
          include: {
            passengers: true,
            bookingSeats: {
              include: {
                tripSeat: { include: { seat: true } },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: "Trip not found" }, { status: 404 });
    }

    // Generate CSV string
    const headers = ["Seat Number", "Passenger Name", "Age", "Gender", "Phone", "PNR", "Booking Date"];
    const rows: string[] = [headers.join(",")];

    for (const booking of trip.bookings) {
      for (let i = 0; i < booking.passengers.length; i++) {
        const passenger = booking.passengers[i];
        const assignedSeat = booking.bookingSeats[i]?.tripSeat.seat.seatNumber || "N/A";

        rows.push([
          `"${assignedSeat}"`,
          `"${passenger.fullName.replace(/"/g, '""')}"`,
          passenger.age,
          `"${passenger.gender}"`,
          `"${passenger.phone || ""}"`,
          `"${booking.pnr}"`,
          `"${booking.bookingDate.toISOString()}"`,
        ].join(","));
      }
    }

    const csvContent = rows.join("\n");
    const filename = `manifest-${trip.route.source}-to-${trip.route.destination}-${trip.id.slice(0, 8)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export manifest error:", error);
    return NextResponse.json({ success: false, error: "Failed to export manifest" }, { status: 500 });
  }
}

