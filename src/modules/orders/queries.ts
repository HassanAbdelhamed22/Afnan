import "server-only";

import { requireUser } from "@/modules/auth/dal";
import { getCustomerOrderByNumber, listCustomerOrders } from "./repository";

export async function getCustomerOrders() {
  const session = await requireUser();
  return listCustomerOrders(session.user.id);
}

export async function getCustomerOrder(orderNumber: string) {
  const session = await requireUser();
  return getCustomerOrderByNumber(session.user.id, orderNumber);
}
