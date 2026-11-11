import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { cleanExpiredLocks } from "@/services/booking.service";
import { BusType, SeatStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source")?.trim();
    const destination = searchParams.get("destination")?.trim();
    const dateStr = searchParams.get("date");
    const busTypeParam = searchParams.get("busType") as BusType | null;
    const sortBy = searchParams.get("sortBy") || "departure"; // "departure" | "price"
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";

    // Clean expired locks before checking availability
    await cleanExpiredLocks();

    // Query filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: "SCHEDULED",
    };

    if (source || destination) {
      where.route = {};
      if (source) {
        where.route.source = { contains: source, mode: "insensitive" };
      }
      if (destination) {
        where.route.destination = { contains: destination, mode: "insensitive" };
      }
    }

    if (busTypeParam && Object.values(BusType).includes(busTypeParam)) {
      where.bus = { busType: busTypeParam };
    }

    if (dateStr) {
      const searchDate = new Date(dateStr);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);

        where.departureDateTime = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    // Determine sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.baseFare = order;
    } else {
      orderBy.departureDateTime = order;
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy,
      include: {
        bus: {
          include: { operator: true },
        },
        route: {
          include: {
            routeStops: {
              include: { stop: true },
              orderBy: { stopOrder: "asc" },
            },
          },
        },
        tripSeats: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // Transform trips with calculated available seats count and amenity parsing
    const results = trips.map((t) => {
      let amenitiesList: string[] = [];
      try {
        amenitiesList = JSON.parse(t.bus.amenities);
      } catch {
        amenitiesList = [];
      }

      const availableSeatsCount = t.tripSeats.filter(
        (ts) => ts.status === SeatStatus.AVAILABLE
      ).length;

      return {
        id: t.id,
        busId: t.busId,
        busName: t.bus.busName,
        busType: t.bus.busType,
        registrationNumber: t.bus.registrationNumber,
        operatorName: t.bus.operator.name,
        amenities: amenitiesList,
        routeId: t.routeId,
        source: t.route.source,
        destination: t.route.destination,
        distance: t.route.distance,
        estimatedDuration: t.route.estimatedDuration,
        departureDateTime: t.departureDateTime.toISOString(),
        arrivalDateTime: t.arrivalDateTime.toISOString(),
        baseFare: t.baseFare,
        status: t.status,
        availableSeatsCount,
        totalSeats: t.bus.totalSeats,
        stops: t.route.routeStops.map((rs) => ({
          stopId: rs.stopId,
          stopName: rs.stop.name,
          city: rs.stop.city,
          stopOrder: rs.stopOrder,
          arrivalOffset: rs.arrivalOffset,
          departureOffset: rs.departureOffset,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Trip search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search trips" },
      { status: 500 }
    );
  }
}
