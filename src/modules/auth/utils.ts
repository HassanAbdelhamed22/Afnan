export function getSafeReturnTo(
  value: FormDataEntryValue | null,
  fallback = "/",
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//")) {
    return fallback;
  }

  return value;
}
