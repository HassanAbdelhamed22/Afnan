"use client";

import { useState, useCallback } from "react";
import type { ZodType, ZodError } from "zod";

type FieldErrors = Record<string, string[] | undefined>;

interface UseFormValidationOptions<T extends Record<string, unknown>> {
  /** The Zod schema (or individual field schemas map) to validate against */
  schema: ZodType<T>;
  /** Optional form values state to enable cross-field validation */
  values?: T;
}

interface UseFormValidationReturn {
  /** Current field errors keyed by field name */
  errors: FieldErrors;
  /** Set of field names that have been blurred at least once */
  touched: Set<string>;
  /** Call on input blur — validates the single field and marks it touched */
  handleBlur: (fieldName: string, value: string) => void;
  /** Call on input change — re-validates only if the field was previously touched */
  handleChange: (fieldName: string, value: string) => void;
  /** Validate all fields at once (call before submit). Returns true if valid. */
  validateAll: (formData: Record<string, string>) => boolean;
  /** Clear all errors and touched state */
  reset: () => void;
  /** Set errors from server response (merge with existing) */
  setServerErrors: (serverErrors: Record<string, string[]>) => void;
}

/**
 * Client-side form validation hook that reuses Zod schemas.
 *
 * Validates individual fields on blur and on change (after first touch).
 * This is purely UX — server validation always remains the authoritative check.
 */
export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  values,
}: UseFormValidationOptions<T>): UseFormValidationReturn {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(() => new Set());

  const validateField = useCallback(
    (fieldName: string, value: string) => {
      /*
       * Validate the whole schema with partial data, then extract only
       * the error for the targeted field. This approach ensures cross-field
       * validations (like confirmPassword matching password) work correctly.
       */
      const data = values
        ? { ...values, [fieldName]: value }
        : { [fieldName]: value };
      const result = schema.safeParse(data);

      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        return;
      }

      const zodError = result.error as ZodError;
      const fieldIssues = zodError.issues.filter(
        (issue) => issue.path[0] === fieldName,
      );

      if (fieldIssues.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: fieldIssues.map((i) => i.message),
        }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    },
    [schema, values],
  );

  const handleBlur = useCallback(
    (fieldName: string, value: string) => {
      setTouched((prev) => {
        if (prev.has(fieldName)) return prev;
        const next = new Set(prev);
        next.add(fieldName);
        return next;
      });
      validateField(fieldName, value);
    },
    [validateField],
  );

  const handleChange = useCallback(
    (fieldName: string, value: string) => {
      /* Only re-validate if the field was previously touched (blurred) */
      if (touched.has(fieldName)) {
        validateField(fieldName, value);
      }
    },
    [validateField, touched],
  );

  const validateAll = useCallback(
    (formData: Record<string, string>): boolean => {
      /* Mark every field as touched */
      setTouched((prev) => {
        const next = new Set(prev);
        for (const key of Object.keys(formData)) {
          next.add(key);
        }
        return next;
      });

      const result = schema.safeParse(formData);

      if (result.success) {
        setErrors({});
        return true;
      }

      const zodError = result.error as ZodError;
      const allErrors: FieldErrors = {};
      for (const issue of zodError.issues) {
        const field = String(issue.path[0]);
        if (!allErrors[field]) {
          allErrors[field] = [];
        }
        allErrors[field]!.push(issue.message);
      }
      setErrors(allErrors);
      return false;
    },
    [schema],
  );

  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  const setServerErrors = useCallback(
    (serverErrors: Record<string, string[]>) => {
      setErrors((prev) => ({ ...prev, ...serverErrors }));
      /* Mark errored fields as touched so future changes re-validate */
      setTouched((prev) => {
        const next = new Set(prev);
        for (const key of Object.keys(serverErrors)) {
          next.add(key);
        }
        return next;
      });
    },
    [],
  );

  return {
    errors,
    touched,
    handleBlur,
    handleChange,
    validateAll,
    reset,
    setServerErrors,
  };
}
