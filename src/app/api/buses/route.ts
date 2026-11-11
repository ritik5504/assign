import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentSession, requireRole } from "@/lib/auth/session";
import { busSchema } from "@/lib/validations";
import { Role, SeatType } from "@prisma/client";

export async function GET() {
  try {
    const buses = await prisma.bus.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        operator: true,
        seats: {
          orderBy: [{ row: "asc" }, { column: "asc" }],
        },
        _count: {
          select: { trips: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: buses,
    });
  } catch (error) {
    console.error("Fetch buses error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch buses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();

    const parsed = busSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { operatorId, registrationNumber, busName, busType, totalSeats, amenities, status } = parsed.data;

    const existingReg = await prisma.bus.findUnique({
      where: { registrationNumber: registrationNumber.toUpperCase() },
    });

    if (existingReg) {
      return NextResponse.json(
        { success: false, error: "A bus with this registration number already exists" },
        { status: 409 }
      );
    }

    // Create bus and generate corresponding seat layout in a transaction
    const bus = await prisma.$transaction(async (tx) => {
      const createdBus = await tx.bus.create({
        data: {
          operatorId,
          registrationNumber: registrationNumber.toUpperCase(),
          busName,
          busType,
          totalSeats,
          amenities: JSON.stringify(amenities),
          status,
        },
      });

      // Generate seats
      const seatData = [];
      if (busType === "AC_SLEEPER" || busType === "NON_AC_SLEEPER") {
        const berths = Math.floor(totalSeats / 2);
        const rows = Math.ceil(berths / 3);
        for (let r = 1; r <= rows; r++) {
          seatData.push({ busId: createdBus.id, seatNumber: `L${(r - 1) * 3 + 1}`, seatType: SeatType.WINDOW, row: r, column: 1 });
          seatData.push({ busId: createdBus.id, seatNumber: `L${(r - 1) * 3 + 2}`, seatType: SeatType.AISLE, row: r, column: 2 });
          seatData.push({ busId: createdBus.id, seatNumber: `L${(r - 1) * 3 + 3}`, seatType: SeatType.WINDOW, row: r, column: 3 });
          seatData.push({ busId: createdBus.id, seatNumber: `U${(r - 1) * 3 + 1}`, seatType: SeatType.UPPER_SLEEPER, row: r + rows, column: 1 });
          seatData.push({ busId: createdBus.id, seatNumber: `U${(r - 1) * 3 + 2}`, seatType: SeatType.UPPER_SLEEPER, row: r + rows, column: 2 });
          seatData.push({ busId: createdBus.id, seatNumber: `U${(r - 1) * 3 + 3}`, seatType: SeatType.UPPER_SLEEPER, row: r + rows, column: 3 });
        }
      } else {
        const rows = Math.ceil(totalSeats / 4);
        for (let r = 1; r <= rows; r++) {
          seatData.push({ busId: createdBus.id, seatNumber: `${r}A`, seatType: SeatType.WINDOW, row: r, column: 1 });
          seatData.push({ busId: createdBus.id, seatNumber: `${r}B`, seatType: SeatType.AISLE, row: r, column: 2 });
          seatData.push({ busId: createdBus.id, seatNumber: `${r}C`, seatType: SeatType.AISLE, row: r, column: 3 });
          seatData.push({ busId: createdBus.id, seatNumber: `${r}D`, seatType: SeatType.WINDOW, row: r, column: 4 });
        }
      }

      await tx.seat.createMany({ data: seatData });

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "BUS_CREATED",
          entityType: "BUS",
          entityId: createdBus.id,
          metadata: JSON.stringify({ registrationNumber, totalSeats, busType }),
        },
      });

      return createdBus;
    });

    return NextResponse.json({ success: true, data: bus }, { status: 201 });
  } catch (error) {
    console.error("Create bus error:", error);
    return NextResponse.json({ success: false, error: "Failed to create bus" }, { status: 500 });
  }
}
