export function normalizePersonalization(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function calculateLineTotal(unitPriceAmount: number, quantity: number): number {
  if (!Number.isInteger(unitPriceAmount) || unitPriceAmount < 0) {
    throw new Error("Unit price must be a non-negative integer");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }
  return unitPriceAmount * quantity;
}

export function calculateCartSubtotal(
  items: Array<{ unitPriceAmount: number; quantity: number; available: boolean }>,
): number {
  return items.reduce(
    (total, item) =>
      item.available
        ? total + calculateLineTotal(item.unitPriceAmount, item.quantity)
        : total,
    0,
  );
}
