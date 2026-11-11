import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getAdminOverviewMetrics } from "@/services/report.service";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([Role.ADMIN, Role.OPERATOR]);
    const metrics = await getAdminOverviewMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Overview metrics error:", error);
    return NextResponse.json({ success: false, error: "Unauthorized or failed to fetch metrics" }, { status: 403 });
  }
}

