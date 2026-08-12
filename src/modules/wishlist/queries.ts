import "server-only";

import { requireUser } from "@/modules/auth/dal";

import { getWishlist } from "./service";

export async function getCustomerWishlist() {
  const session = await requireUser();
  return getWishlist(session.user.id);
}
