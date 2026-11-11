import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, data: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: { user: session },
  });
}
