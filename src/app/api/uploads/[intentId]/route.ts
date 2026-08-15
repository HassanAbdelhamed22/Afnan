import { AppError } from "@/lib/errors/app-error";
import { apiSuccess } from "@/lib/http/api-response";
import { withApiHandler } from "@/lib/http/with-api-handler";
import { requireAdmin, requireUser } from "@/modules/auth/dal";
import { discardUploadIntent, getUploadIntentPurpose } from "@/modules/uploads/service";

export const DELETE = withApiHandler(async (_request, context: { params: Promise<{ intentId: string }> }) => {
  const session = await requireUser();
  const { intentId } = await context.params;
  if (!/^[a-f\d]{24}$/i.test(intentId)) throw new AppError({ code: "VALIDATION_ERROR", message: "Invalid upload intent", statusCode: 400 });
  const purpose = await getUploadIntentPurpose(session.user.id, intentId);
  if (purpose !== "CUSTOM_REQUEST_REFERENCE") await requireAdmin();
  return apiSuccess({ discarded: await discardUploadIntent(session.user.id, intentId, purpose) });
});
