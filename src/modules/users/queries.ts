import "server-only";

import { requireUser } from "@/modules/auth/dal";

import type { CustomerProfileDTO, AddressDTO } from "./dto";
import { listAddressRecords } from "./repository";

export async function getCustomerProfile(): Promise<CustomerProfileDTO> {
  const session = await requireUser();
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    phoneE164: session.user.phoneE164,
    whatsappE164: session.user.whatsappE164,
    avatarUrl: session.user.image || undefined,
  };
}

export async function listCustomerAddresses(): Promise<AddressDTO[]> {
  const session = await requireUser();
  return listAddressRecords(session.user.id);
}
