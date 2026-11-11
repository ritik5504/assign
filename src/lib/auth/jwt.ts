import { SignJWT, jwtVerify } from "jose";
import { SessionUser } from "@/types";

const secretKey = process.env.AUTH_SECRET || "bus-booking-production-secret-key-super-secure-faang-standards-2026";
const encodedKey = new TextEncoder().encode(secretKey);

export async function signSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as SessionUser["role"],
      phone: (payload.phone as string) || null,
    };
  } catch {
    return null;
  }
}

