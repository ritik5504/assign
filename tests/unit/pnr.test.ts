import { describe, it, expect } from "vitest";
import { generateUniquePNR } from "@/services/pnr.service";

describe("Unit: PNR Generator Service", () => {
  it("should generate a valid PNR with correct prefix format", async () => {
    const pnr = await generateUniquePNR();
    expect(pnr).toBeDefined();
    expect(typeof pnr).toBe("string");
    expect(pnr.startsWith("PNR-")).toBe(true);
    // Format: PNR-YYMM-XXXXXX
    const parts = pnr.split("-");
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe("PNR");
    expect(parts[1].length).toBe(4); // YYMM
    expect(parts[2].length).toBeGreaterThanOrEqual(6);
  });

  it("should generate distinct unique PNRs sequentially", async () => {
    const pnr1 = await generateUniquePNR();
    const pnr2 = await generateUniquePNR();
    expect(pnr1).not.toBe(pnr2);
  });
});
