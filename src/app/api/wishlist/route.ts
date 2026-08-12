import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { requireUser } from "@/modules/auth/dal";
import { getWishlist } from "@/modules/wishlist/service";

export const GET = withApiHandler(async () => {
  const session = await requireUser();
  const wishlist = await getWishlist(session.user.id);
  const response = apiSuccess({
    itemCount: wishlist.itemCount,
    productIds: wishlist.productIds,
  });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
