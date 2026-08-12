import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { AppError } from "@/lib/errors/app-error";
import { requireUser } from "@/modules/auth/dal";
import { completeUploadSchema } from "@/modules/uploads/schemas";
import { completeUploadIntent } from "@/modules/uploads/service";

export const POST = withApiHandler(async (request) => {
  const session = await requireUser();
  const parsed = completeUploadSchema.safeParse(await request.json());
  if (!parsed.success) throw new AppError({ code: "VALIDATION_ERROR", message: "Upload completion data is invalid", statusCode: 400 });
  return apiSuccess(await completeUploadIntent(session.user.id, parsed.data));
});
