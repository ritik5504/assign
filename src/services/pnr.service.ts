import crypto from "crypto";
import { prisma } from "@/lib/prisma/client";

/**
 * Generates an uppercase unique Passenger Name Record (PNR)
 * Format: PNR-YYMM-XXXXXX
 */
export async function generateUniquePNR(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, "0")}`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const candidatePNR = `PNR-${yearMonth}-${randomHex}`;

    const existing = await prisma.booking.findUnique({
      where: { pnr: candidatePNR },
      select: { id: true },
    });

    if (!existing) {
      return candidatePNR;
    }
  }

  // Fallback with timestamp to guarantee uniqueness
  const timestampHex = Date.now().toString(36).toUpperCase();
  return `PNR-${yearMonth}-${timestampHex}`;
}
