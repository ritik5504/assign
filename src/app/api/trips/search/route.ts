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
      AND: [],
    };

    if (source) {
      where.AND.push({
        route: {
          OR: [
            { source: { contains: source, mode: "insensitive" } },
            { routeStops: { some: { stop: { city: { contains: source, mode: "insensitive" } } } } },
            { routeStops: { some: { stop: { name: { contains: source, mode: "insensitive" } } } } },
          ],
        },
      });
    }

    if (destination) {
      where.AND.push({
        route: {
          OR: [
            { destination: { contains: destination, mode: "insensitive" } },
            { routeStops: { some: { stop: { city: { contains: destination, mode: "insensitive" } } } } },
            { routeStops: { some: { stop: { name: { contains: destination, mode: "insensitive" } } } } },
          ],
        },
      });
    }

    if (where.AND.length === 0) {
      delete where.AND;
    }

    if (busTypeParam && Object.values(BusType).includes(busTypeParam)) {
      where.bus = { busType: busTypeParam };
    }

    if (dateStr) {
      // Parse YYYY-MM-DD or standard ISO date string
      // Allow a generous day window around the date (from UTC start minus 12h to UTC end plus 12h)
      // to cleanly handle timezone differences between client browser (e.g. IST) and server UTC
      const dateParts = dateStr.includes("-") ? dateStr.split("-").map(Number) : null;
      if (dateParts && dateParts.length === 3 && !isNaN(dateParts[0]) && !isNaN(dateParts[1]) && !isNaN(dateParts[2])) {
        const [year, month, day] = dateParts;
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - 12 * 3600 * 1000);
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) + 12 * 3600 * 1000);

        where.departureDateTime = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else {
        const searchDate = new Date(dateStr);
        if (!isNaN(searchDate.getTime())) {
          const startOfDay = new Date(searchDate.getTime() - 12 * 3600 * 1000);
          const endOfDay = new Date(searchDate.getTime() + 36 * 3600 * 1000);

          where.departureDateTime = {
            gte: startOfDay,
            lte: endOfDay,
          };
        }
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

