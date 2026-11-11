import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { tripSchema } from "@/lib/validations";
import { Role, SeatStatus } from "@prisma/client";

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { departureDateTime: "asc" },
      include: {
        bus: { include: { operator: true } },
        route: true,
        tripSeats: {
          select: { id: true, status: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    const transformed = trips.map((t) => {
      const availableSeats = t.tripSeats.filter((ts) => ts.status === SeatStatus.AVAILABLE).length;
      const bookedSeats = t.tripSeats.filter((ts) => ts.status === SeatStatus.BOOKED).length;

      return {
        ...t,
        availableSeats,
        bookedSeats,
        totalSeats: t.tripSeats.length,
      };
    });

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error("Fetch trips error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trips" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();

    const parsed = tripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { busId, routeId, departureDateTime, arrivalDateTime, baseFare, status } = parsed.data;

    // Verify bus exists and has seats
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true },
    });

    if (!bus) {
      return NextResponse.json({ success: false, error: "Bus not found" }, { status: 404 });
    }

    if (bus.seats.length === 0) {
      return NextResponse.json({ success: false, error: "Bus has no configured seats" }, { status: 400 });
    }

    // Create trip and all TripSeat inventory rows atomically
    const trip = await prisma.$transaction(async (tx) => {
      const createdTrip = await tx.trip.create({
        data: {
          busId,
          routeId,
          departureDateTime: new Date(departureDateTime),
          arrivalDateTime: new Date(arrivalDateTime),
          baseFare,
          status,
        },
      });

      const tripSeatsData = bus.seats.map((seat) => ({
        tripId: createdTrip.id,
        seatId: seat.id,
        status: SeatStatus.AVAILABLE,
        version: 0,
      }));

      await tx.tripSeat.createMany({ data: tripSeatsData });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "TRIP_SCHEDULED",
          entityType: "TRIP",
          entityId: createdTrip.id,
          metadata: JSON.stringify({ busId, routeId, departureDateTime, baseFare }),
        },
      });

      return createdTrip;
    });

    return NextResponse.json({ success: true, data: trip }, { status: 201 });
  } catch (error) {
    console.error("Create trip error:", error);
    return NextResponse.json({ success: false, error: "Failed to schedule trip" }, { status: 500 });
  }
}

