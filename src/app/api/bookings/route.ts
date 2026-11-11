import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, requireAuth } from "@/lib/auth/session";
import { createBookingSchema } from "@/lib/validations";
import { createBooking } from "@/services/booking.service";
import { prisma } from "@/lib/prisma/client";
import { BookingStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tripId, seatIds, passengers, idempotencyKey } = parsed.data;

    const booking = await createBooking({
      userId: session.id,
      tripId,
      seatIds,
      passengers,
      idempotencyKey,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking confirmed successfully",
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Booking failed";
    console.error("Booking error:", msg);

    if (msg.includes("CONCURRENCY") || msg.includes("ALREADY_BOOKED") || msg.includes("LOCKED")) {
      return NextResponse.json({ success: false, error: msg }, { status: 409 });
    }

    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as BookingStatus | null;
    const pnrParam = searchParams.get("pnr");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Customer can only see their own bookings
    if (session.role === "CUSTOMER") {
      where.userId = session.id;
    }

    if (statusParam && Object.values(BookingStatus).includes(statusParam)) {
      where.status = statusParam;
    }

    if (pnrParam) {
      where.pnr = { contains: pnrParam.trim(), mode: "insensitive" };
    }

    const bookings = await prisma.booking.findMany({
      where,
      take: limit,
      orderBy: { bookingDate: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        trip: {
          include: {
            bus: { include: { operator: true } },
            route: true,
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

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

