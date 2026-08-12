import "server-only";

import { Types } from "mongoose";

import { connectMongoose } from "@/lib/mongoose";
import { NotFoundError } from "@/lib/errors/app-error";

import type { AddressDTO } from "./dto";
import { AddressModel, type IAddress } from "./model";
import type { AddressInput } from "./schemas";

type AddressRecord = Pick<
  IAddress,
  | "_id"
  | "label"
  | "recipientName"
  | "phoneE164"
  | "governorateCode"
  | "city"
  | "area"
  | "street"
  | "building"
  | "floor"
  | "apartment"
  | "landmark"
  | "notes"
  | "isDefault"
  | "createdAt"
  | "updatedAt"
>;

function mapAddressToDTO(address: AddressRecord): AddressDTO {
  return {
    id: address._id.toString(),
    label: address.label,
    recipientName: address.recipientName,
    phoneE164: address.phoneE164,
    governorateCode: address.governorateCode,
    city: address.city,
    area: address.area || undefined,
    street: address.street,
    building: address.building,
    floor: address.floor,
    apartment: address.apartment,
    landmark: address.landmark || undefined,
    notes: address.notes || undefined,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

function toPersistenceInput(input: AddressInput) {
  return {
    label: input.label,
    recipientName: input.recipientName,
    phoneE164: input.phone,
    governorateCode: input.governorateCode,
    city: input.city,
    area: input.area,
    street: input.street,
    building: input.building,
    floor: input.floor,
    apartment: input.apartment,
    landmark: input.landmark,
    notes: input.notes,
    isDefault: input.isDefault,
  };
}

export async function listAddressRecords(userId: string): Promise<AddressDTO[]> {
  await connectMongoose();
  const addresses = await AddressModel.find({ userId })
    .select("label recipientName phoneE164 governorateCode city area street building floor apartment landmark notes isDefault createdAt updatedAt")
    .sort({ isDefault: -1, createdAt: -1 })
    .lean<AddressRecord[]>();

  return addresses.map(mapAddressToDTO);
}

export async function createAddressRecord(userId: string, input: AddressInput): Promise<AddressDTO> {
  await connectMongoose();
  const hasAddresses = await AddressModel.exists({ userId });
  const shouldBeDefault = input.isDefault || !hasAddresses;

  if (shouldBeDefault) {
    await AddressModel.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } });
  }

  const address = await AddressModel.create({
    userId,
    ...toPersistenceInput({ ...input, isDefault: shouldBeDefault }),
  });

  return mapAddressToDTO(address);
}

export async function updateAddressRecord(
  userId: string,
  addressId: string,
  input: AddressInput,
): Promise<AddressDTO> {
  await connectMongoose();
  const objectId = new Types.ObjectId(addressId);
  const current = await AddressModel.findOne({ _id: objectId, userId })
    .select("isDefault")
    .lean<{ isDefault: boolean }>();

  if (!current) {
    throw new NotFoundError("Address not found");
  }

  const shouldBeDefault = input.isDefault || current.isDefault;
  if (shouldBeDefault) {
    await AddressModel.updateMany(
      { userId, _id: { $ne: objectId }, isDefault: true },
      { $set: { isDefault: false } },
    );
  }

  const address = await AddressModel.findOneAndUpdate(
    { _id: objectId, userId },
    { $set: toPersistenceInput({ ...input, isDefault: shouldBeDefault }) },
    { new: true, runValidators: true },
  ).lean<AddressRecord>();

  if (!address) {
    throw new NotFoundError("Address not found");
  }

  return mapAddressToDTO(address);
}

export async function setDefaultAddressRecord(userId: string, addressId: string): Promise<void> {
  await connectMongoose();
  const objectId = new Types.ObjectId(addressId);
  const address = await AddressModel.exists({ _id: objectId, userId });
  if (!address) {
    throw new NotFoundError("Address not found");
  }

  await AddressModel.updateMany(
    { userId, _id: { $ne: objectId }, isDefault: true },
    { $set: { isDefault: false } },
  );
  await AddressModel.updateOne({ _id: objectId, userId }, { $set: { isDefault: true } });
}

export async function deleteAddressRecord(userId: string, addressId: string): Promise<void> {
  await connectMongoose();
  const objectId = new Types.ObjectId(addressId);
  const deleted = await AddressModel.findOneAndDelete({ _id: objectId, userId })
    .select("isDefault")
    .lean<{ isDefault: boolean }>();

  if (!deleted) {
    throw new NotFoundError("Address not found");
  }

  if (deleted.isDefault) {
    const replacement = await AddressModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("_id")
      .lean<{ _id: Types.ObjectId }>();
    if (replacement) {
      await AddressModel.updateOne(
        { _id: replacement._id, userId },
        { $set: { isDefault: true } },
      );
    }
  }
}
