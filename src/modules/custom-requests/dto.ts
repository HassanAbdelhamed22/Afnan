import type { MediaAsset } from "@/modules/uploads/types";

export type CustomRequestStatus = "SUBMITTED" | "CONTACTED" | "ACCEPTED" | "REJECTED" | "COMPLETED";

export interface CustomRequestDTO {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  material?: string;
  colors: string[];
  dimensions?: string;
  quantity: number;
  desiredDate?: string;
  budgetMinAmount?: number;
  budgetMaxAmount?: number;
  referenceImages: MediaAsset[];
  status: CustomRequestStatus;
  createdAt: string;
}

export interface CreateCustomRequestResultDTO { requestNumber: string }
