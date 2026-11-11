import { describe, it, expect, vi } from "vitest";
import { calculateRefund } from "@/services/cancellation.service";

describe("Unit: Cancellation & Refund Calculation Engine", () => {
  it("should calculate 90% refund for cancellation more than 24h before departure", async () => {
    const totalAmount = 100.0;
    const now = new Date();
    // 30 hours in future
    const departure = new Date(now.getTime() + 30 * 60 * 60 * 1000);

    const calc = await calculateRefund(totalAmount, departure);
    expect(calc.isEligible).toBe(true);
    expect(calc.refundPercentage).toBe(90.0);
    expect(calc.refundAmount).toBe(90.0);
    expect(calc.cancellationAmount).toBe(10.0);
  });

  it("should calculate 75% refund for cancellation between 12h and 24h before departure", async () => {
    const totalAmount = 100.0;
    const now = new Date();
    // 16 hours in future
    const departure = new Date(now.getTime() + 16 * 60 * 60 * 1000);

    const calc = await calculateRefund(totalAmount, departure);
    expect(calc.isEligible).toBe(true);
    expect(calc.refundPercentage).toBe(75.0);
    expect(calc.refundAmount).toBe(75.0);
    expect(calc.cancellationAmount).toBe(25.0);
  });

  it("should calculate 50% refund for cancellation between 6h and 12h before departure", async () => {
    const totalAmount = 100.0;
    const now = new Date();
    // 8 hours in future
    const departure = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const calc = await calculateRefund(totalAmount, departure);
    expect(calc.isEligible).toBe(true);
    expect(calc.refundPercentage).toBe(50.0);
    expect(calc.refundAmount).toBe(50.0);
    expect(calc.cancellationAmount).toBe(50.0);
  });

  it("should calculate 0% refund for cancellation less than 6h before departure", async () => {
    const totalAmount = 100.0;
    const now = new Date();
    // 2 hours in future
    const departure = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const calc = await calculateRefund(totalAmount, departure);
    expect(calc.isEligible).toBe(true);
    expect(calc.refundPercentage).toBe(0.0);
    expect(calc.refundAmount).toBe(0.0);
    expect(calc.cancellationAmount).toBe(100.0);
  });

  it("should mark trip not eligible if departure has already passed", async () => {
    const totalAmount = 100.0;
    const now = new Date();
    // 1 hour in the past
    const departure = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    const calc = await calculateRefund(totalAmount, departure);
    expect(calc.isEligible).toBe(false);
    expect(calc.refundAmount).toBe(0);
  });
});

