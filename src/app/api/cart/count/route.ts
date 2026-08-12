import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { requireUser } from "@/modules/auth/dal";
import { getCart } from "@/modules/cart/service";

export const GET = withApiHandler(async () => {
  const session = await requireUser();
  const cart = await getCart(session.user.id);
  const response = apiSuccess({ itemCount: cart.itemCount });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
