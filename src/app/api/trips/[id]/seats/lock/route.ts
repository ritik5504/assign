import { NextRequest, NextResponse } from "next/server";
import { lockSeats, releaseSeatsLock } from "@/services/booking.service";
import { lockSeatsSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const body = await req.json();

    const parsed = lockSeatsSchema.safeParse({ ...body, tripId });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { seatIds } = parsed.data;
    const lockResult = await lockSeats(tripId, seatIds);

    return NextResponse.json({
      success: true,
      message: "Seats locked successfully for 5 minutes",
      data: lockResult,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to lock seats";
    const status = msg.includes("ALREADY_BOOKED") || msg.includes("LOCKED") ? 409 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const body = await req.json();
    const seatIds = body.seatIds;

    if (Array.isArray(seatIds) && seatIds.length > 0) {
      await releaseSeatsLock(tripId, seatIds);
    }

    return NextResponse.json({
      success: true,
      message: "Seats lock released",
    });
  } catch (error) {
    console.error("Release lock error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to release lock" },
      { status: 500 }
    );
  }
}
