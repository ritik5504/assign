import { prisma } from "@/lib/prisma/client";
import { generateUniquePNR } from "./pnr.service";
import { BookingStatus, SeatStatus } from "@prisma/client";

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export interface LockResult {
  lockedSeatIds: string[];
  expiresAt: string;
}

/**
 * Clean up expired seat locks across all trips or for a specific trip.
 * Transitions LOCKED -> AVAILABLE if lockedUntil < now.
 */
export async function cleanExpiredLocks(tripId?: string): Promise<number> {
  const now = new Date();
  const whereClause: { status: SeatStatus; lockedUntil: { lt: Date }; tripId?: string } = {
    status: SeatStatus.LOCKED,
    lockedUntil: { lt: now },
  };

  if (tripId) {
    whereClause.tripId = tripId;
  }

  const result = await prisma.tripSeat.updateMany({
    where: whereClause,
    data: {
      status: SeatStatus.AVAILABLE,
      lockedUntil: null,
    },
  });

  return result.count;
}

/**
 * Acquire temporary lock on seats for 5 minutes.
 * Must be atomic: if any seat is BOOKED or LOCKED by another valid lock, reject all.
 */
export async function lockSeats(tripId: string, seatIds: string[]): Promise<LockResult> {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

  // Clean expired locks first for this trip
  await cleanExpiredLocks(tripId);

  return prisma.$transaction(async (tx) => {
    // 1. Fetch trip seats with FOR UPDATE lock simulation
    const tripSeats = await tx.tripSeat.findMany({
      where: {
        tripId,
        seatId: { in: seatIds },
      },
      include: { seat: true },
    });

    if (tripSeats.length !== seatIds.length) {
      throw new Error("SOME_SEATS_NOT_FOUND");
    }

    // 2. Verify all requested seats are currently AVAILABLE
    for (const ts of tripSeats) {
      if (ts.status === SeatStatus.BOOKED) {
        throw new Error(`SEAT_ALREADY_BOOKED: Seat ${ts.seat.seatNumber} is already confirmed.`);
      }

      if (ts.status === SeatStatus.LOCKED && ts.lockedUntil && ts.lockedUntil > now) {
        throw new Error(`SEAT_LOCKED: Seat ${ts.seat.seatNumber} is currently selected by another customer.`);
      }
    }

    // 3. Atomically update all seats to LOCKED
    await tx.tripSeat.updateMany({
      where: {
        id: { in: tripSeats.map((ts) => ts.id) },
        // Ensure another transaction hasn't booked it in the microsecond gap
        status: { not: SeatStatus.BOOKED },
      },
      data: {
        status: SeatStatus.LOCKED,
        lockedUntil: lockExpiresAt,
        version: { increment: 1 },
      },
    });

    return {
      lockedSeatIds: seatIds,
      expiresAt: lockExpiresAt.toISOString(),
    };
  });
}

/**
 * Release temporary locks on seats if user deselects or cancels checkout.
 */
export async function releaseSeatsLock(tripId: string, seatIds: string[]): Promise<void> {
  await prisma.tripSeat.updateMany({
    where: {
      tripId,
      seatId: { in: seatIds },
      status: SeatStatus.LOCKED,
    },
    data: {
      status: SeatStatus.AVAILABLE,
      lockedUntil: null,
    },
  });
}

export interface CreateBookingParams {
  userId: string;
  tripId: string;
  seatIds: string[];
  passengers: {
    fullName: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
    phone?: string | null;
  }[];
  idempotencyKey?: string;
}

/**
 * Core Booking Engine with concurrency control, idempotency, and PostgreSQL transactions.
 */
export async function createBooking(params: CreateBookingParams) {
  const { userId, tripId, seatIds, passengers, idempotencyKey } = params;
  const now = new Date();

  // 1. Check idempotency: If this request has already been processed successfully, return existing booking
  if (idempotencyKey) {
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: "BOOKING_CREATED",
        metadata: { contains: idempotencyKey },
      },
    });
    if (existingLog && existingLog.entityId) {
      const existingBooking = await prisma.booking.findUnique({
        where: { id: existingLog.entityId },
        include: {
          trip: { include: { bus: true, route: true } },
          passengers: true,
          bookingSeats: { include: { tripSeat: { include: { seat: true } } } },
        },
      });
      if (existingBooking) return existingBooking;
    }
  }

  // 2. Clean expired locks first
  await cleanExpiredLocks(tripId);

  // 3. Execute atomic transaction
  return prisma.$transaction(async (tx) => {
    // A. Verify Trip existence and status
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { bus: true, route: true },
    });

    if (!trip) {
      throw new Error("TRIP_NOT_FOUND");
    }

    if (trip.status === "CANCELLED" || trip.status === "COMPLETED") {
      throw new Error("TRIP_NOT_AVAILABLE_FOR_BOOKING");
    }

    if (new Date(trip.departureDateTime) <= now) {
      throw new Error("TRIP_ALREADY_DEPARTED");
    }

    // B. Fetch and lock trip seats for update
    const tripSeats = await tx.tripSeat.findMany({
      where: {
        tripId,
        seatId: { in: seatIds },
      },
      include: { seat: true },
    });

    if (tripSeats.length !== seatIds.length) {
      throw new Error("SOME_SEATS_NOT_FOUND");
    }

    // C. Concurrency Guard: Check if ANY seat is already BOOKED or LOCKED by someone else
    for (const ts of tripSeats) {
      if (ts.status === SeatStatus.BOOKED) {
        throw new Error(`CONCURRENCY_CONFLICT: Seat ${ts.seat.seatNumber} has already been booked by another user.`);
      }

      // If locked, verify if lock expired
      if (ts.status === SeatStatus.LOCKED && ts.lockedUntil && ts.lockedUntil < now) {
        // expired lock, okay to proceed
      }
    }

    // D. Calculate total fare
    const totalAmount = tripSeats.length * trip.baseFare;

    // E. Generate Unique PNR
    const pnr = await generateUniquePNR();

    // F. Create the Booking record
    const booking = await tx.booking.create({
      data: {
        pnr,
        userId,
        tripId,
        totalAmount,
        status: BookingStatus.CONFIRMED,
        bookingDate: now,
      },
    });

    // G. Create Passenger records
    await tx.passenger.createMany({
      data: passengers.map((p) => ({
        bookingId: booking.id,
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
      })),
    });

    // H. Create BookingSeat records
    await tx.bookingSeat.createMany({
      data: tripSeats.map((ts) => ({
        bookingId: booking.id,
        tripSeatId: ts.id,
        fare: trip.baseFare,
      })),
    });

    // I. Atomically mark trip seats as BOOKED
    // Using conditional update to ensure no concurrent modification won the race
    const updateCount = await tx.tripSeat.updateMany({
      where: {
        id: { in: tripSeats.map((ts) => ts.id) },
        status: { not: SeatStatus.BOOKED },
      },
      data: {
        status: SeatStatus.BOOKED,
        lockedUntil: null,
        version: { increment: 1 },
      },
    });

    if (updateCount.count !== tripSeats.length) {
      throw new Error("CONCURRENCY_RACE_CONDITION: Another user secured one of these seats during checkout.");
    }

    // J. Create AuditLog record
    await tx.auditLog.create({
      data: {
        userId,
        action: "BOOKING_CREATED",
        entityType: "BOOKING",
        entityId: booking.id,
        metadata: JSON.stringify({
          pnr,
          tripId,
          seatNumbers: tripSeats.map((ts) => ts.seat.seatNumber),
          totalAmount,
          idempotencyKey: idempotencyKey || null,
        }),
      },
    });

    // Return full booking details
    return tx.booking.findUnique({
      where: { id: booking.id },
      include: {
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
      },
    });
  });
}

