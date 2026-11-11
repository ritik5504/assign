import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma/client";
import { createBooking, lockSeats } from "@/services/booking.service";
import { cancelBooking } from "@/services/cancellation.service";
import { SeatStatus, BookingStatus } from "@prisma/client";

describe("Integration: Booking Engine, Concurrency & Data Integrity", () => {
  let customer1Id: string;
  let customer2Id: string;
  let testTripId: string;
  let testSeatId1: string;
  let testSeatId2: string;

  beforeAll(async () => {
    // Fetch seeded users and trip
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      take: 2,
    });
    customer1Id = users[0].id;
    customer2Id = users[1].id;

    // Fetch an upcoming scheduled trip with available seats
    const trip = await prisma.trip.findFirst({
      where: {
        status: "SCHEDULED",
        departureDateTime: { gt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      },
      include: {
        tripSeats: {
          where: { status: SeatStatus.AVAILABLE },
          take: 5,
        },
      },
    });

    if (!trip || trip.tripSeats.length < 3) {
      throw new Error("Seed data trip with available seats required for test suite");
    }

    testTripId = trip.id;
    testSeatId1 = trip.tripSeats[0].seatId;
    testSeatId2 = trip.tripSeats[1].seatId;
  });

  it("should successfully lock seats for 5 minutes", async () => {
    const lockResult = await lockSeats(testTripId, [testSeatId1]);
    expect(lockResult.lockedSeatIds).toContain(testSeatId1);
    expect(new Date(lockResult.expiresAt).getTime()).toBeGreaterThan(Date.now());

    // Verify database state is LOCKED
    const tripSeat = await prisma.tripSeat.findUnique({
      where: {
        tripId_seatId: { tripId: testTripId, seatId: testSeatId1 },
      },
    });
    expect(tripSeat?.status).toBe(SeatStatus.LOCKED);
    expect(tripSeat?.lockedUntil).not.toBeNull();
  });

  it("should confirm booking atomically and mark seats as BOOKED", async () => {
    const booking = await createBooking({
      userId: customer1Id,
      tripId: testTripId,
      seatIds: [testSeatId1],
      passengers: [
        {
          fullName: "Alice Wonderland",
          age: 30,
          gender: "FEMALE",
          phone: "+1-555-0301",
        },
      ],
    });

    expect(booking).toBeDefined();
    expect(booking?.status).toBe(BookingStatus.CONFIRMED);
    expect(booking?.pnr.startsWith("PNR-")).toBe(true);

    // Verify trip seat transitioned to BOOKED
    const tripSeat = await prisma.tripSeat.findUnique({
      where: {
        tripId_seatId: { tripId: testTripId, seatId: testSeatId1 },
      },
    });
    expect(tripSeat?.status).toBe(SeatStatus.BOOKED);
  });

  it("CRITICAL: should prevent booking an already-booked seat", async () => {
    // Attempting to book testSeatId1 which was just confirmed above
    await expect(
      createBooking({
        userId: customer2Id,
        tripId: testTripId,
        seatIds: [testSeatId1],
        passengers: [
          {
            fullName: "Bob Interloper",
            age: 35,
            gender: "MALE",
          },
        ],
      })
    ).rejects.toThrow(/already been booked|CONCURRENCY_CONFLICT/i);
  });

  it("CRITICAL CONCURRENCY TEST: simultaneous booking requests for the same seat - exactly one must succeed", async () => {
    // We use testSeatId2 which is currently AVAILABLE
    // Launch two concurrent promises simultaneously with Promise.allSettled
    const promise1 = createBooking({
      userId: customer1Id,
      tripId: testTripId,
      seatIds: [testSeatId2],
      passengers: [{ fullName: "Competitor 1", age: 25, gender: "MALE" }],
    });

    const promise2 = createBooking({
      userId: customer2Id,
      tripId: testTripId,
      seatIds: [testSeatId2],
      passengers: [{ fullName: "Competitor 2", age: 26, gender: "FEMALE" }],
    });

    const [res1, res2] = await Promise.allSettled([promise1, promise2]);

    const successes = [res1, res2].filter((r) => r.status === "fulfilled");
    const rejections = [res1, res2].filter((r) => r.status === "rejected");

    // Proves that only ONE request succeeds and the other is safely rejected with conflict
    expect(successes.length).toBe(1);
    expect(rejections.length).toBe(1);

    // Verify the seat is cleanly marked as BOOKED once
    const tripSeat = await prisma.tripSeat.findUnique({
      where: {
        tripId_seatId: { tripId: testTripId, seatId: testSeatId2 },
      },
    });
    expect(tripSeat?.status).toBe(SeatStatus.BOOKED);
  });

  it("should cancel booking, calculate refund, and release seats back to AVAILABLE", async () => {
    // Pick another available seat for cancellation testing
    const trip = await prisma.trip.findUnique({
      where: { id: testTripId },
      include: {
        tripSeats: {
          where: { status: SeatStatus.AVAILABLE },
          take: 1,
        },
      },
    });
    const seatIdToCancel = trip!.tripSeats[0].seatId;

    // 1. Create a confirmed booking
    const booking = await createBooking({
      userId: customer1Id,
      tripId: testTripId,
      seatIds: [seatIdToCancel],
      passengers: [{ fullName: "To Cancel Passenger", age: 40, gender: "MALE" }],
    });

    expect(booking).toBeDefined();

    // 2. Cancel it
    const cancelResult = await cancelBooking({
      bookingId: booking!.id,
      userId: customer1Id,
      userRole: "CUSTOMER",
      reason: "Scheduling conflict",
    });

    expect(cancelResult.booking.status).toBe(BookingStatus.CANCELLED);
    expect(cancelResult.cancellation.refundAmount).toBeGreaterThan(0);

    // 3. Verify seat is released back to AVAILABLE in the database
    const tripSeat = await prisma.tripSeat.findUnique({
      where: {
        tripId_seatId: { tripId: testTripId, seatId: seatIdToCancel },
      },
    });
    expect(tripSeat?.status).toBe(SeatStatus.AVAILABLE);
    expect(tripSeat?.lockedUntil).toBeNull();
  });

  it("should prevent unauthorized cancellation by another customer", async () => {
    // Pick another seat
    const trip = await prisma.trip.findUnique({
      where: { id: testTripId },
      include: {
        tripSeats: {
          where: { status: SeatStatus.AVAILABLE },
          take: 1,
        },
      },
    });
    const seatId = trip!.tripSeats[0].seatId;

    const booking = await createBooking({
      userId: customer1Id,
      tripId: testTripId,
      seatIds: [seatId],
      passengers: [{ fullName: "Customer 1 Only", age: 29, gender: "FEMALE" }],
    });

    // Customer 2 attempts to cancel Customer 1's booking
    await expect(
      cancelBooking({
        bookingId: booking!.id,
        userId: customer2Id,
        userRole: "CUSTOMER",
        reason: "Malicious cancellation attempt",
      })
    ).rejects.toThrow("FORBIDDEN_BOOKING_ACCESS");
  });
});
