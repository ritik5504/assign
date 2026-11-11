import { prisma } from "@/lib/prisma/client";
import { BookingStatus, RefundStatus, SeatStatus } from "@prisma/client";

export interface RefundCalculation {
  hoursRemaining: number;
  refundPercentage: number;
  cancellationAmount: number;
  refundAmount: number;
  isEligible: boolean;
}

/**
 * Calculates refund amount dynamically from database cancellation policies.
 */
export async function calculateRefund(
  totalAmount: number,
  departureDateTime: Date
): Promise<RefundCalculation> {
  const now = new Date();
  const diffMs = departureDateTime.getTime() - now.getTime();
  const hoursRemaining = diffMs / (1000 * 60 * 60);

  // If bus has already departed, no cancellation
  if (hoursRemaining <= 0) {
    return {
      hoursRemaining: 0,
      refundPercentage: 0,
      cancellationAmount: totalAmount,
      refundAmount: 0,
      isEligible: false,
    };
  }

  // Fetch active policies sorted descending by hours threshold
  const policies = await prisma.cancellationPolicy.findMany({
    where: { isActive: true },
    orderBy: { hoursBeforeDeparture: "desc" },
  });

  let matchingPercentage = 0;
  for (const policy of policies) {
    if (hoursRemaining >= policy.hoursBeforeDeparture) {
      matchingPercentage = policy.refundPercentage;
      break;
    }
  }

  const refundAmount = Math.round(((totalAmount * matchingPercentage) / 100) * 100) / 100;
  const cancellationAmount = Math.round((totalAmount - refundAmount) * 100) / 100;

  return {
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    refundPercentage: matchingPercentage,
    cancellationAmount,
    refundAmount,
    isEligible: true,
  };
}

/**
 * Transactionally cancels a booking, updates seat statuses back to AVAILABLE,
 * creates the cancellation and audit log records.
 */
export async function cancelBooking(params: {
  bookingId: string;
  userId: string;
  userRole: string;
  reason: string;
}) {
  const { bookingId, userId, userRole, reason } = params;

  return prisma.$transaction(async (tx) => {
    // 1. Fetch booking with related trip and seats
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        trip: true,
        bookingSeats: true,
        cancellation: true,
      },
    });

    if (!booking) {
      throw new Error("BOOKING_NOT_FOUND");
    }

    // 2. Ownership check
    if (userRole !== "ADMIN" && booking.userId !== userId) {
      throw new Error("FORBIDDEN_BOOKING_ACCESS");
    }

    // 3. Status check
    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error("ALREADY_CANCELLED");
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new Error("CANNOT_CANCEL_UNCONFIRMED_BOOKING");
    }

    // 4. Calculate refund
    const refundCalc = await calculateRefund(booking.totalAmount, booking.trip.departureDateTime);
    if (!refundCalc.isEligible) {
      throw new Error("TRIP_ALREADY_DEPARTED");
    }

    // 5. Update Booking status to CANCELLED
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    // 6. Release seats: Update all trip seats back to AVAILABLE
    const tripSeatIds = booking.bookingSeats.map((bs) => bs.tripSeatId);
    await tx.tripSeat.updateMany({
      where: { id: { in: tripSeatIds } },
      data: {
        status: SeatStatus.AVAILABLE,
        lockedUntil: null,
      },
    });

    // 7. Create cancellation record
    const cancellation = await tx.cancellation.create({
      data: {
        bookingId: booking.id,
        cancellationReason: reason,
        cancellationAmount: refundCalc.cancellationAmount,
        refundAmount: refundCalc.refundAmount,
        refundStatus: RefundStatus.PROCESSED,
      },
    });

    // 8. Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: "BOOKING_CANCELLED",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: JSON.stringify({
          pnr: booking.pnr,
          refundAmount: refundCalc.refundAmount,
          cancellationAmount: refundCalc.cancellationAmount,
          releasedSeatsCount: tripSeatIds.length,
          reason,
        }),
      },
    });

    return {
      booking: updatedBooking,
      cancellation,
      refundDetails: refundCalc,
    };
  });
}

