"use client";

import type { UploadPurpose } from "./paths";

type ApiPayload<T> = { success: true; data: T } | { success: false; error: { message: string } };

export async function discardClientUpload(intentId: string) {
  await fetch(`/api/uploads/${encodeURIComponent(intentId)}`, { method: "DELETE" });
}

export async function uploadManagedImage(file: File, purpose: UploadPurpose) {
  let intentId: string | undefined;
  try {
    const signedResponse = await fetch("/api/uploads/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, mimeType: file.type, sizeBytes: file.size, purpose }) });
    const signed = await signedResponse.json() as ApiPayload<{ intentId: string; cloudName: string; apiKey: string; timestamp: number; folder: string; publicId: string; signature: string }>;
    if (!signed.success) throw new Error(signed.error.message);
    intentId = signed.data.intentId;

    const upload = new FormData();
    upload.set("file", file); upload.set("api_key", signed.data.apiKey); upload.set("timestamp", String(signed.data.timestamp));
    upload.set("folder", signed.data.folder); upload.set("public_id", signed.data.publicId); upload.set("signature", signed.data.signature);
    const providerResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`, { method: "POST", body: upload });
    const provider = await providerResponse.json() as { public_id?: string; version?: number; signature?: string; error?: { message?: string } };
    if (!providerResponse.ok || !provider.public_id || !provider.version || !provider.signature) throw new Error(provider.error?.message ?? "Image upload failed");

    const completeResponse = await fetch("/api/uploads/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intentId, publicId: provider.public_id, version: provider.version, signature: provider.signature }) });
    const completed = await completeResponse.json() as ApiPayload<{ intentId: string }>;
    if (!completed.success) throw new Error(completed.error.message);
    return completed.data.intentId;
  } catch (error) {
    if (intentId) await discardClientUpload(intentId).catch(() => undefined);
    throw error;
  }
}
