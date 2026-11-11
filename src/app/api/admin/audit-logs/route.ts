import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 403 });
  }
}
