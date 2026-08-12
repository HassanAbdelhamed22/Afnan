import "server-only";
import { requireUser } from "@/modules/auth/dal";
import { getCustomerCustomRequestByNumber, listCustomerCustomRequests } from "./repository";
export async function getCustomerCustomRequests() { const session = await requireUser(); return listCustomerCustomRequests(session.user.id); }
export async function getCustomerCustomRequest(requestNumber: string) { const session = await requireUser(); return getCustomerCustomRequestByNumber(session.user.id, requestNumber); }
