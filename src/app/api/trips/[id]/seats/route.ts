import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { cleanExpiredLocks } from "@/services/booking.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    // Clean any expired locks first
    await cleanExpiredLocks(tripId);

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bus: true,
        route: true,
        tripSeats: {
          include: {
            seat: true,
          },
          orderBy: [
            { seat: { row: "asc" } },
            { seat: { column: "asc" } },
          ],
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    const seats = trip.tripSeats.map((ts) => ({
      id: ts.id,
      seatId: ts.seatId,
      seatNumber: ts.seat.seatNumber,
      seatType: ts.seat.seatType,
      row: ts.seat.row,
      column: ts.seat.column,
      status: ts.status,
      lockedUntil: ts.lockedUntil ? ts.lockedUntil.toISOString() : null,
      fare: trip.baseFare,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tripId: trip.id,
        busName: trip.bus.busName,
        busType: trip.bus.busType,
        totalSeats: trip.bus.totalSeats,
        baseFare: trip.baseFare,
        departureDateTime: trip.departureDateTime.toISOString(),
        arrivalDateTime: trip.arrivalDateTime.toISOString(),
        source: trip.route.source,
        destination: trip.route.destination,
        seats,
      },
    });
  } catch (error) {
    console.error("Fetch seats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch seats" },
      { status: 500 }
    );
  }
}

