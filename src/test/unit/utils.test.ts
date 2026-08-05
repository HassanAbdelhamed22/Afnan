import { describe, it, expect } from "vitest";

import { getSafeReturnTo } from "@/modules/auth/utils";

describe("getSafeReturnTo", () => {
  it("should return the original value for valid relative paths", () => {
    expect(getSafeReturnTo("/")).toBe("/");
    expect(getSafeReturnTo("/shop")).toBe("/shop");
    expect(getSafeReturnTo("/account/profile")).toBe("/account/profile");
    expect(getSafeReturnTo("/category/ceramics?sort=new")).toBe("/category/ceramics?sort=new");
  });

  it("should return the fallback value for absolute URLs to prevent open-redirect exploits", () => {
    expect(getSafeReturnTo("https://evil-site.com")).toBe("/");
    expect(getSafeReturnTo("http://evil-site.com/login")).toBe("/");
    expect(getSafeReturnTo("ftp://example.com")).toBe("/");
  });

  it("should return the fallback value for protocol-relative URLs", () => {
    expect(getSafeReturnTo("//evil-site.com")).toBe("/");
    expect(getSafeReturnTo("///evil-site.com")).toBe("/");
  });

  it("should return the fallback value for non-string or invalid inputs", () => {
    expect(getSafeReturnTo(null)).toBe("/");
    expect(getSafeReturnTo("")).toBe("/");
    expect(getSafeReturnTo("shop")).toBe("/"); // Must start with /
  });

  it("should allow a custom fallback path", () => {
    expect(getSafeReturnTo("https://evil-site.com", "/shop")).toBe("/shop");
    expect(getSafeReturnTo(null, "/dashboard")).toBe("/dashboard");
  });
});
