import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { AppError } from "@/lib/errors/app-error";
import { requireAdmin, requireUser } from "@/modules/auth/dal";
import { createUploadIntentSchema } from "@/modules/uploads/schemas";
import { createUploadIntent } from "@/modules/uploads/service";

export const POST = withApiHandler(async (request) => {
  const session = await requireUser();
  const parsed = createUploadIntentSchema.safeParse(await request.json());
  if (!parsed.success) throw new AppError({ code: "VALIDATION_ERROR", message: "Select a JPEG, PNG, or WebP image up to 5 MB", statusCode: 400 });
  if (parsed.data.purpose === "PRODUCT_IMAGE") await requireAdmin();
  return apiSuccess(await createUploadIntent(session.user.id, parsed.data));
});
