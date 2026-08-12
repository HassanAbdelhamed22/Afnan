import "server-only";

import { requireUser } from "@/modules/auth/dal";

import type { CartDTO } from "./dto";
import { getCart } from "./service";

export async function getCustomerCart(): Promise<CartDTO> {
  const session = await requireUser();
  return getCart(session.user.id);
}
