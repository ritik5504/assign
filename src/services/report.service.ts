import { prisma } from "@/lib/prisma/client";
import { BookingStatus, SeatStatus } from "@prisma/client";

export async function getAdminOverviewMetrics() {
  const [
    totalBuses,
    totalRoutes,
    totalTrips,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    revenueAgg,
    totalTripSeats,
    bookedTripSeats,
  ] = await Promise.all([
    prisma.bus.count({ where: { status: "ACTIVE" } }),
    prisma.route.count(),
    prisma.trip.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    prisma.booking.count({ where: { status: BookingStatus.CANCELLED } }),
    prisma.booking.aggregate({
      where: { status: BookingStatus.CONFIRMED },
      _sum: { totalAmount: true },
    }),
    prisma.tripSeat.count(),
    prisma.tripSeat.count({ where: { status: SeatStatus.BOOKED } }),
  ]);

  const totalRevenue = revenueAgg._sum.totalAmount || 0;
  const occupancyPercentage =
    totalTripSeats > 0 ? Math.round((bookedTripSeats / totalTripSeats) * 1000) / 10 : 0;

  return {
    totalBuses,
    totalRoutes,
    totalTrips,
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    totalRevenue,
    totalTripSeats,
    bookedTripSeats,
    occupancyPercentage,
  };
}

export async function getRouteOccupancyMetrics() {
  const routes = await prisma.route.findMany({
    include: {
      trips: {
        include: {
          tripSeats: true,
        },
      },
    },
  });

  return routes.map((route) => {
    let totalSeats = 0;
    let bookedSeats = 0;

    for (const trip of route.trips) {
      totalSeats += trip.tripSeats.length;
      bookedSeats += trip.tripSeats.filter((ts) => ts.status === SeatStatus.BOOKED).length;
    }

    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 1000) / 10 : 0;

    return {
      routeId: route.id,
      source: route.source,
      destination: route.destination,
      tripsCount: route.trips.length,
      totalSeats,
      bookedSeats,
      occupancyRate,
    };
  });
}

export async function getBusOccupancyMetrics() {
  const buses = await prisma.bus.findMany({
    include: {
      operator: true,
      trips: {
        include: {
          tripSeats: true,
        },
      },
    },
  });

  return buses.map((bus) => {
    let totalSeats = 0;
    let bookedSeats = 0;

    for (const trip of bus.trips) {
      totalSeats += trip.tripSeats.length;
      bookedSeats += trip.tripSeats.filter((ts) => ts.status === SeatStatus.BOOKED).length;
    }

    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 1000) / 10 : 0;

    return {
      busId: bus.id,
      busName: bus.busName,
      registrationNumber: bus.registrationNumber,
      operatorName: bus.operator.name,
      busType: bus.busType,
      tripsCount: bus.trips.length,
      totalSeats,
      bookedSeats,
      occupancyRate,
    };
  });
}

export async function getRevenueReports() {
  // Group confirmed bookings by date
  const bookings = await prisma.booking.findMany({
    where: { status: BookingStatus.CONFIRMED },
    select: {
      bookingDate: true,
      totalAmount: true,
    },
    orderBy: { bookingDate: "asc" },
  });

  const dailyMap: Record<string, { date: string; revenue: number; bookingsCount: number }> = {};

  for (const b of bookings) {
    const day = b.bookingDate.toISOString().split("T")[0];
    if (!dailyMap[day]) {
      dailyMap[day] = { date: day, revenue: 0, bookingsCount: 0 };
    }
    dailyMap[day].revenue += b.totalAmount;
    dailyMap[day].bookingsCount += 1;
  }

  return Object.values(dailyMap);
}

