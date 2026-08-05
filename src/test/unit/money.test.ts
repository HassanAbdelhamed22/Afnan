import { describe, it, expect } from "vitest";

import { formatEGP, toMinorUnits } from "@/lib/money";

describe("toMinorUnits", () => {
  it("should convert float EGP values to integer minor units (piastres/cents)", () => {
    expect(toMinorUnits(10)).toBe(1000);
    expect(toMinorUnits(12.5)).toBe(1250);
    expect(toMinorUnits(0)).toBe(0);
  });

  it("should round floating point minor unit conversions to nearest integer", () => {
    expect(toMinorUnits(12.555)).toBe(1256);
    expect(toMinorUnits(12.554)).toBe(1255);
  });
});

describe("formatEGP", () => {
  it("should format minor units correctly into Egyptian Pounds currency layout", () => {
    // Remove non-breaking spaces if any are returned by toLocaleString locale formatting
    const cleanStr = (val: string) => val.replace(/\u00a0/g, " ");

    expect(cleanStr(formatEGP(1000))).toContain("10.00");
    expect(cleanStr(formatEGP(125000))).toContain("1,250.00");
    expect(cleanStr(formatEGP(0))).toContain("0.00");
  });
});
