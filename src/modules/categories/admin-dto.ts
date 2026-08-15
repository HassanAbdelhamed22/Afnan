export interface AdminCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  activeProductCount: number;
  updatedAt: string;
}

export interface AdminCategoryOptionDTO {
  id: string;
  name: string;
}

export interface PaginatedAdminCategoriesDTO {
  categories: AdminCategoryDTO[];
  total: number;
  page: number;
  totalPages: number;
}
