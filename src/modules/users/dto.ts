export interface CustomerProfileDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneE164: string;
  whatsappE164: string;
  avatarUrl?: string;
}

export interface AddressDTO {
  id: string;
  label: string;
  recipientName: string;
  phoneE164: string;
  governorateCode: string;
  city: string;
  area?: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
