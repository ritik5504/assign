import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, passengerSchema, createBookingSchema } from "@/lib/validations";

describe("Unit: Zod Validation Schemas", () => {
  it("should validate correct passenger information", () => {
    const valid = {
      fullName: "Jane Passenger",
      age: 28,
      gender: "FEMALE",
      phone: "+1-555-0199",
    };
    const result = passengerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("should reject passenger with invalid age or missing name", () => {
    const invalidAge = {
      fullName: "Jane Passenger",
      age: -5,
      gender: "FEMALE",
    };
    expect(passengerSchema.safeParse(invalidAge).success).toBe(false);

    const invalidName = {
      fullName: "J",
      age: 28,
      gender: "FEMALE",
    };
    expect(passengerSchema.safeParse(invalidName).success).toBe(false);
  });

  it("should reject booking if passenger count does not match selected seats count", () => {
    const tripId = "11111111-1111-1111-1111-111111111111";
    const seatId1 = "22222222-2222-2222-2222-222222222222";
    const seatId2 = "33333333-3333-3333-3333-333333333333";

    // 2 seats, but only 1 passenger
    const mismatch = {
      tripId,
      seatIds: [seatId1, seatId2],
      passengers: [
        {
          fullName: "Single Passenger",
          age: 30,
          gender: "MALE",
        },
      ],
    };

    const result = createBookingSchema.safeParse(mismatch);
    expect(result.success).toBe(false);
  });
});

