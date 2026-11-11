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
        bus: { include: { operator: true } },
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

    // Flatten into manifest items
    const manifest = [];
    for (const booking of trip.bookings) {
      for (let i = 0; i < booking.passengers.length; i++) {
        const passenger = booking.passengers[i];
        const assignedSeat = booking.bookingSeats[i]?.tripSeat.seat.seatNumber || "N/A";

        manifest.push({
          bookingId: booking.id,
          pnr: booking.pnr,
          seatNumber: assignedSeat,
          fullName: passenger.fullName,
          age: passenger.age,
          gender: passenger.gender,
          phone: passenger.phone || "N/A",
          bookingDate: booking.bookingDate.toISOString(),
        });
      }
    }

    // Sort manifest by seatNumber
    manifest.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));

    return NextResponse.json({
      success: true,
      data: {
        tripId: trip.id,
        busName: trip.bus.busName,
        registrationNumber: trip.bus.registrationNumber,
        operatorName: trip.bus.operator.name,
        source: trip.route.source,
        destination: trip.route.destination,
        departureDateTime: trip.departureDateTime.toISOString(),
        totalPassengers: manifest.length,
        manifest,
      },
    });
  } catch (error) {
    console.error("Manifest error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate manifest" }, { status: 500 });
  }
}

