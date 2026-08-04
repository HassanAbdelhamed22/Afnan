// Money utility converting minor units to EGP and vice versa
export function formatEGP(minorUnits: number): string {
  return (minorUnits / 100).toLocaleString("en-EG", {
    style: "currency",
    currency: "EGP",
  });
}

export function toMinorUnits(egp: number): number {
  return Math.round(egp * 100);
}
