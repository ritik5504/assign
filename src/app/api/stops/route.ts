import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { stopSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const stops = await prisma.stop.findMany({
      orderBy: { city: "asc" },
    });
    return NextResponse.json({ success: true, data: stops });
  } catch (error) {
    console.error("Fetch stops error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch stops" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();

    const parsed = stopSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, city, address } = parsed.data;

    const stop = await prisma.stop.create({
      data: { name, city, address },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "STOP_CREATED",
        entityType: "STOP",
        entityId: stop.id,
        metadata: JSON.stringify({ name, city }),
      },
    });

    return NextResponse.json({ success: true, data: stop }, { status: 201 });
  } catch (error) {
    console.error("Create stop error:", error);
    return NextResponse.json({ success: false, error: "Failed to create stop" }, { status: 500 });
  }
}

