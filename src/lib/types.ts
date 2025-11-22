// src/lib/types.ts

// Tipe sederhana untuk objek gambar dari API Anda
export interface ApiImage {
    id: number;
    url: string;
  }
  
  // Tipe untuk data Banner yang sudah bersih
  export interface Banner {
    id: number;
    imageUrl: string;
  }
  
  // Tipe untuk data Kategori yang sudah bersih
  export interface Category {
    id: number;
    name: string;
    imageUrl: string;
  }
  
  // Tipe untuk data Produk yang sudah bersih dan detail
  export interface Product {
    id: number;
    name: string;
    description: string | null;
    images: ApiImage[];
    categories: ProductCategory[];
    isBestSeller?: boolean; // TAMBAH INI - untuk best seller products
  }
  
  // Tipe untuk objek kategori yang ada di dalam relasi produk
  export interface ProductCategory {
    id: number;
    name: string;
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
      isBestSeller?: boolean; // TAMBAH INI - sesuai dengan field di Strapi
    }[];
  }
  
  export interface StrapiSingleProductResponse {
    data: {
      id: number;
      name: string;
      deskripsi: string | null; // Sesuaikan dengan nama field di Strapi
      images: ApiImage[];
      categories: ProductCategory[];
      isBestSeller?: boolean; // TAMBAH INI - sesuai dengan field di Strapi
    };
  }