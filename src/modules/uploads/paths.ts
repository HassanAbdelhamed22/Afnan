export type UploadPurpose = "CUSTOM_REQUEST_REFERENCE" | "PRODUCT_IMAGE";

function purposeDirectory(purpose: UploadPurpose) {
  return purpose === "PRODUCT_IMAGE" ? "products" : "custom-requests";
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
