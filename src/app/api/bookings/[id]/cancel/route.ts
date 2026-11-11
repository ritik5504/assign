import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { cancelBookingSchema } from "@/lib/validations";
import { cancelBooking } from "@/services/cancellation.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: bookingId } = await params;
    const body = await req.json();

    const parsed = cancelBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cancellationReason } = parsed.data;

    const result = await cancelBooking({
      bookingId,
      userId: session.id,
      userRole: session.role,
      reason: cancellationReason,
    });

    return NextResponse.json({
      success: true,
      message: "Ticket cancelled successfully and refund processed",
      data: result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Cancellation failed";
    console.error("Cancellation error:", msg);

    if (msg === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    if (msg === "FORBIDDEN_BOOKING_ACCESS") {
      return NextResponse.json({ success: false, error: "You are not authorized to cancel this booking" }, { status: 403 });
    }
    if (msg === "TRIP_ALREADY_DEPARTED") {
      return NextResponse.json({ success: false, error: "Cannot cancel ticket as the trip has already departed" }, { status: 400 });
    }
    if (msg === "ALREADY_CANCELLED") {
      return NextResponse.json({ success: false, error: "This booking is already cancelled" }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
