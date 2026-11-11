import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getRevenueReports } from "@/services/report.service";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireRole([Role.ADMIN]);
    const revenue = await getRevenueReports();
    return NextResponse.json({ success: true, data: revenue });
  } catch (error) {
    console.error("Revenue report error:", error);
    return NextResponse.json({ success: false, error: "Unauthorized or failed to fetch revenue" }, { status: 403 });
  }
}

