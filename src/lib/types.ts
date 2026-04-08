// ===============================================
// TIPE UNTUK API IMAGES
// ===============================================

export interface ApiImage {
  id: number;
  url: string;
}

// ===============================================
// TIPE UNTUK DATA YANG SUDAH BERSIH (CLEAN DATA)
// ===============================================

export interface Banner {
  id: number;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  children?: Category[];
  parent?: {
    id: number;
    name: string;
  } | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  images: ApiImage[];
  categories: ProductCategory[];
  isBestSeller?: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface Portfolio {
  id: number;
  title: string;
  slug?: string;
  description: string;
  pict: string[];
  imageUrl?: string;
  Big_project: boolean;
  Portfolio_Category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===============================================
// TIPE UNTUK RESPON MENTAH DARI API STRAPI V5
// ===============================================

export interface StrapiBannerResponse {
  data: {
    id: number;
    images: ApiImage[];
  }[];
}

export interface StrapiCategoryResponse {
  data: {
    id: number;
    name: string;
    image: ApiImage | null;
    children:
      | {
          id: number;
          name: string;
          image: ApiImage | null;
        }
      | {
          id: number;
          name: string;
          image: ApiImage | null;
        }[]
      | null;
    parent: {
      id: number;
      name: string;
    } | null;
  }[];
}

export interface StrapiProductListResponse {
  data: {
    id: number;
    name: string;
    deskripsi: string | null;
    images: ApiImage[];
    categories: ProductCategory[];
    isBestSeller?: boolean;
  }[];
}

export interface StrapiSingleProductResponse {
  data: {
    id: number;
    name: string;
    deskripsi: string | null;
    images: ApiImage[];
    categories: ProductCategory[];
    isBestSeller?: boolean;
  };
}

// Strapi v5 - flat structure, no attributes wrapper
export interface StrapiPortfolioResponse {
  data: {
    id: number;
    title: string;
    slug?: string;
    Description: string;
    pict: {
      id: number;
      url: string;
      formats?: {
        medium?: { url: string };
        small?: { url: string };
        thumbnail?: { url: string };
      };
    }[];
    Big_project: boolean;
    Portfolio_Category?: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
}