import { describe, it, expect } from "vitest";

import { normalizeEgyptianPhone, InvalidEgyptianPhoneError } from "@/lib/phone";

describe("normalizeEgyptianPhone", () => {
  it("should normalize valid local Egyptian mobile numbers", () => {
    expect(normalizeEgyptianPhone("01012345678")).toBe("+201012345678");
    expect(normalizeEgyptianPhone("01112345678")).toBe("+201112345678");
    expect(normalizeEgyptianPhone("01212345678")).toBe("+201212345678");
    expect(normalizeEgyptianPhone("01512345678")).toBe("+201512345678");
  });

  it("should normalize numbers containing spaces and special formatting", () => {
    expect(normalizeEgyptianPhone("+20 101 234 5678")).toBe("+201012345678");
    expect(normalizeEgyptianPhone("00201012345678")).toBe("+201012345678");
    expect(normalizeEgyptianPhone("201012345678")).toBe("+201012345678");
    expect(normalizeEgyptianPhone("010-1234-5678")).toBe("+201012345678");
  });

  it("should prepend leading zero if missing but international code is absent", () => {
    expect(normalizeEgyptianPhone("1012345678")).toBe("+201012345678");
  });

  it("should throw InvalidEgyptianPhoneError for invalid formats or lengths", () => {
    expect(() => normalizeEgyptianPhone("0101234567")).toThrow(InvalidEgyptianPhoneError);
    expect(() => normalizeEgyptianPhone("010123456789")).toThrow(InvalidEgyptianPhoneError);
    expect(() => normalizeEgyptianPhone("0325123456")).toThrow(InvalidEgyptianPhoneError); // Landline
    expect(() => normalizeEgyptianPhone("abcdefghijk")).toThrow(InvalidEgyptianPhoneError);
  });
});
