import { z } from "zod";

// Simple class merge utility placeholder.
export function cn(...inputs: unknown[]) {
  return inputs.filter(Boolean).join(" ");
}

export function getZodFieldErrors(error: z.ZodError): Record<string, string[]> {
  const tree = z.treeifyError(error) as unknown as {
    errors: string[];
    properties?: Record<string, { errors: string[] }>;
  };
  const fieldErrors: Record<string, string[]> = {};
  if (tree.properties) {
    for (const [key, value] of Object.entries(tree.properties)) {
      if (value?.errors) {
        fieldErrors[key] = value.errors;
      }
    }
  }
  return fieldErrors;
}
