import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma/client";
import { createBooking, lockSeats } from "@/services/booking.service";
import { cancelBooking } from "@/services/cancellation.service";
import { getAdminOverviewMetrics } from "@/services/report.service";
import bcrypt from "bcryptjs";
import { Role, SeatStatus, BookingStatus } from "@prisma/client";

describe("E2E Critical Flow: Search -> Lock -> Booking -> Manifest -> Report -> Cancellation", () => {
  let e2eUser: { id: string; email: string; name: string };
  let tripId: string;
  let seatIdA: string;
  let seatIdB: string;
  let confirmedPNR: string;
  let bookingId: string;
  let initialMetrics: Awaited<ReturnType<typeof getAdminOverviewMetrics>>;

  beforeAll(async () => {
    // 1. Snapshot initial admin metrics
    initialMetrics = await getAdminOverviewMetrics();

    // 2. Register a dedicated Indian test customer
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const uniqueEmail = `e2e_aarav_${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        name: "Aarav E2E Passenger",
        email: uniqueEmail,
        passwordHash,
        phone: "+91 98765 99881",
        role: Role.CUSTOMER,
      },
    });
    e2eUser = { id: user.id, email: user.email, name: user.name };

    // 3. Find an active scheduled trip from Delhi to Jaipur
    const trip = await prisma.trip.findFirst({
      where: {
        status: "SCHEDULED",
        route: { source: "Delhi", destination: "Jaipur" },
        departureDateTime: { gt: new Date(Date.now() + 10 * 60 * 60 * 1000) },
      },
      include: {
        tripSeats: {
          where: { status: SeatStatus.AVAILABLE },
          include: { seat: true },
          take: 5,
        },
      },
    });

    if (!trip || trip.tripSeats.length < 2) {
      throw new Error("E2E requires a seeded Indian trip with at least 2 available seats");
    }

    tripId = trip.id;
    seatIdA = trip.tripSeats[0].seatId;
    seatIdB = trip.tripSeats[1].seatId;
  });

  it("Step 1: Customer acquires temporary 5-minute atomic lock on 2 seats", async () => {
    const lockResult = await lockSeats(tripId, [seatIdA, seatIdB]);
    expect(lockResult.lockedSeatIds).toHaveLength(2);
    expect(lockResult.lockedSeatIds).toContain(seatIdA);
    expect(lockResult.lockedSeatIds).toContain(seatIdB);

    // Verify both seats are marked LOCKED in the database
    const lockedSeats = await prisma.tripSeat.findMany({
      where: {
        tripId,
        seatId: { in: [seatIdA, seatIdB] },
      },
    });
    expect(lockedSeats.every((s) => s.status === SeatStatus.LOCKED)).toBe(true);
  });

  it("Step 2: Customer executes booking checkout and receives confirmed PNR", async () => {
    const booking = await createBooking({
      userId: e2eUser.id,
      tripId,
      seatIds: [seatIdA, seatIdB],
      passengers: [
        {
          fullName: "Aarav E2E Passenger",
          age: 32,
          gender: "MALE",
          phone: "+91 98765 99881",
        },
        {
          fullName: "Ananya E2E Passenger",
          age: 28,
          gender: "FEMALE",
          phone: "+91 98765 99882",
        },
      ],
      idempotencyKey: `idemp_e2e_${Date.now()}`,
    });

    expect(booking).toBeDefined();
    expect(booking?.status).toBe(BookingStatus.CONFIRMED);
    expect(booking?.pnr.startsWith("PNR-")).toBe(true);
    expect(booking?.passengers).toHaveLength(2);
    expect(booking?.bookingSeats).toHaveLength(2);

    confirmedPNR = booking!.pnr;
    bookingId = booking!.id;

    // Verify seats transitioned to BOOKED
    const bookedSeats = await prisma.tripSeat.findMany({
      where: {
        tripId,
        seatId: { in: [seatIdA, seatIdB] },
      },
    });
    expect(bookedSeats.every((s) => s.status === SeatStatus.BOOKED)).toBe(true);
  });

  it("Step 3: Public PNR verification returns matching boarding ticket", async () => {
    const ticket = await prisma.booking.findUnique({
      where: { pnr: confirmedPNR },
      include: {
        passengers: true,
        bookingSeats: {
          include: { tripSeat: { include: { seat: true } } },
        },
        trip: {
          include: { bus: true, route: true },
        },
      },
    });

    expect(ticket).toBeDefined();
    expect(ticket?.pnr).toBe(confirmedPNR);
    expect(ticket?.trip.route.source).toBe("Delhi");
    expect(ticket?.trip.route.destination).toBe("Jaipur");
    expect(ticket?.passengers.map((p) => p.fullName)).toContain("Aarav E2E Passenger");
  });

  it("Step 4: Operator Trip Manifest reflects newly booked passengers with correct seats", async () => {
    const manifestTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          include: {
            passengers: true,
            bookingSeats: {
              include: { tripSeat: { include: { seat: true } } },
            },
          },
        },
      },
    });

    const allManifestPassengers = manifestTrip!.bookings.flatMap((b) => b.passengers);
    const foundE2EPassenger = allManifestPassengers.find(
      (p) => p.fullName === "Aarav E2E Passenger"
    );
    expect(foundE2EPassenger).toBeDefined();
  });

  it("Step 5: Admin metrics reflect increased revenue and confirmed bookings", async () => {
    const updatedMetrics = await getAdminOverviewMetrics();
    expect(updatedMetrics.confirmedBookings).toBeGreaterThan(initialMetrics.confirmedBookings);
    expect(updatedMetrics.totalRevenue).toBeGreaterThan(initialMetrics.totalRevenue);
  });

  it("Step 6: Customer cancels booking, receives refund, and seats return to AVAILABLE", async () => {
    const cancelResult = await cancelBooking({
      bookingId,
      userId: e2eUser.id,
      userRole: "CUSTOMER",
      reason: "E2E test cancellation workflow",
    });

    expect(cancelResult.booking.status).toBe(BookingStatus.CANCELLED);
    expect(cancelResult.cancellation.refundAmount).toBeGreaterThan(0);

    // Verify seats transitioned back to AVAILABLE in inventory
    const releasedSeats = await prisma.tripSeat.findMany({
      where: {
        tripId,
        seatId: { in: [seatIdA, seatIdB] },
      },
    });
    expect(releasedSeats.every((s) => s.status === SeatStatus.AVAILABLE)).toBe(true);
    expect(releasedSeats.every((s) => s.lockedUntil === null)).toBe(true);
  });
});
