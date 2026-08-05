import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { z } from "zod";

import { useFormValidation } from "@/lib/hooks/use-form-validation";

const testSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
});

describe("useFormValidation Hook", () => {
  it("should initialize with empty errors and touched sets", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.touched.size).toBe(0);
  });

  it("should validate and mark fields as touched on handleBlur", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    /* Blur with invalid name value */
    act(() => {
      result.current.handleBlur("name", "ab");
    });

    expect(result.current.touched.has("name")).toBe(true);
    expect(result.current.errors.name).toContain(
      "Name must be at least 3 characters",
    );

    /* Blur with valid email value */
    act(() => {
      result.current.handleBlur("email", "test@example.com");
    });

    expect(result.current.touched.has("email")).toBe(true);
    expect(result.current.errors.email).toBeUndefined();
  });

  it("should validate on handleChange only if the field was touched", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    /* Change untouched field -> should NOT validate */
    act(() => {
      result.current.handleChange("name", "ab");
    });

    expect(result.current.errors.name).toBeUndefined();

    /* Blur to make it touched -> should validate */
    act(() => {
      result.current.handleBlur("name", "ab");
    });

    expect(result.current.errors.name).toContain(
      "Name must be at least 3 characters",
    );

    /* Change touched field -> should validate and update error */
    act(() => {
      result.current.handleChange("name", "john");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should validate all fields and mark them as touched on validateAll", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    let isValid = false;

    /* Validate invalid form data */
    act(() => {
      isValid = result.current.validateAll({
        name: "ab",
        email: "invalid-email",
      });
    });

    expect(isValid).toBe(false);
    expect(result.current.touched.has("name")).toBe(true);
    expect(result.current.touched.has("email")).toBe(true);
    expect(result.current.errors.name).toContain(
      "Name must be at least 3 characters",
    );
    expect(result.current.errors.email).toContain("Enter a valid email");

    /* Validate valid form data */
    act(() => {
      isValid = result.current.validateAll({
        name: "John Doe",
        email: "john@example.com",
      });
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("should set and merge server errors", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    act(() => {
      result.current.setServerErrors({
        email: ["Email already exists"],
      });
    });

    expect(result.current.errors.email).toContain("Email already exists");
    expect(result.current.touched.has("email")).toBe(true);
  });

  it("should reset errors and touched sets on reset", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema }),
    );

    /* Populate errors */
    act(() => {
      result.current.handleBlur("name", "ab");
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.touched.size).toBeGreaterThan(0);

    /* Reset hook state */
    act(() => {
      result.current.reset();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.touched.size).toBe(0);
  });
});
