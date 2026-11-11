import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { operatorSchema } from "@/lib/validations";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    const operators = await prisma.operator.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buses: {
          select: { id: true, busName: true, registrationNumber: true, status: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: operators });
  } catch (error) {
    console.error("Fetch operators error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch operators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole([Role.ADMIN]);
    const body = await req.json();

    const parsed = operatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, contactDetails, status } = parsed.data;

    const operator = await prisma.operator.create({
      data: { name, contactDetails, status },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "OPERATOR_CREATED",
        entityType: "OPERATOR",
        entityId: operator.id,
      },
    });

    return NextResponse.json({ success: true, data: operator }, { status: 201 });
  } catch (error) {
    console.error("Create operator error:", error);
    return NextResponse.json({ success: false, error: "Failed to create operator" }, { status: 500 });
  }
}
