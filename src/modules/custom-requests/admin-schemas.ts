import { z } from "zod";
export const adminCustomRequestFiltersSchema = z.object({ search: z.string().trim().max(100).default(""), status: z.enum(["ALL", "SUBMITTED", "CONTACTED", "ACCEPTED", "REJECTED", "COMPLETED"]).default("ALL"), sort: z.enum(["newest", "oldest", "target_date"]).default("newest"), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const adminCustomRequestUpdateSchema = z.object({ requestNumber: z.string().trim().min(3).max(80), status: z.enum(["SUBMITTED", "CONTACTED", "ACCEPTED", "REJECTED", "COMPLETED"]), internalNotes: z.string().trim().max(2000).optional() });
export type AdminCustomRequestFilters = z.infer<typeof adminCustomRequestFiltersSchema>;
