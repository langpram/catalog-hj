// src/lib/types.ts - UPDATED DENGAN PORTFOLIO_CATEGORY

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

// Banner
export interface Banner {
  id: number;
  imageUrl: string;
}

// Category
export interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  description: string | null;
  images: ApiImage[];
  categories: ProductCategory[];
  isBestSeller?: boolean;
}

// Product Category (relasi di dalam product)
export interface ProductCategory {
  id: number;
  name: string;
}

// 🔥 Portfolio - UPDATED dengan Portfolio_Category
export interface Portfolio {
  id: number;
  title: string;
  slug?: string;
  description: string;
  pict: string[]; // Array of image URLs
  imageUrl?: string; // Single main image untuk list view
  Big_project: boolean;
  Portfolio_Category?: string; // 🔥 Enumeration value (e.g. "Pemerintahan", "Masjid")
  createdAt?: string;
  updatedAt?: string;
}

// ===============================================
// TIPE UNTUK RESPON MENTAH DARI API STRAPI
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
    image: ApiImage;
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

// 🔥 Portfolio Response dari Strapi
export interface StrapiPortfolioResponse {
  data: {
    id: number;
    attributes: {
      title: string;
      slug?: string;
      Description: string;
      pict: {
        data: {
          id: number;
          attributes: {
            url: string;
            formats?: {
              medium?: { url: string };
              small?: { url: string };
              thumbnail?: { url: string };
            };
          };
        }[];
      };
      Big_project: boolean;
      Portfolio_Category?: string; // 🔥 Enumeration
      createdAt?: string;
      updatedAt?: string;
    };
  }[];
}