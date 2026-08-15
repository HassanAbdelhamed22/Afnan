export type UploadPurpose = "CATEGORY_IMAGE" | "CUSTOM_REQUEST_REFERENCE" | "PRODUCT_IMAGE";

function purposeDirectory(purpose: UploadPurpose) {
  if (purpose === "PRODUCT_IMAGE") return "products";
  if (purpose === "CATEGORY_IMAGE") return "categories";
  return "custom-requests";
}

export function buildUploadFolder(appEnvironment: string, purpose: UploadPurpose, userId: string) {
  return `afnan/${appEnvironment}/${purposeDirectory(purpose)}/${userId}`;
}

export function isOwnedUploadPublicId(publicId: string, appEnvironment: string, purpose: UploadPurpose, userId: string) {
  return publicId.startsWith(`${buildUploadFolder(appEnvironment, purpose, userId)}/`);
}

export function isProductImagePublicId(publicId: string, appEnvironment: string) {
  return publicId.startsWith(`afnan/${appEnvironment}/products/`);
}

export function isUploadPurposePublicId(publicId: string, appEnvironment: string, purpose: UploadPurpose) {
  return publicId.startsWith(`afnan/${appEnvironment}/${purposeDirectory(purpose)}/`);
}
