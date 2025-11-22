// src/lib/api.ts - FIXED VERSION WITH isBestSeller

import {
  Banner,
  Category,
  Product,
  StrapiBannerResponse,
  StrapiCategoryResponse,
  StrapiProductListResponse,
} from "@/lib/types";

const STRAPI_URL = "https://strapi.fairuzulum.me";
const FETCH_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/hero-banner-kategoris?populate=*`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }

    const json: StrapiBannerResponse = await response.json();

    if (!json.data?.[0]?.images) {
      console.warn("No banner images found");
      return [];
    }

    const banners = json.data[0].images.map((image) => ({
      id: image.id,
      imageUrl: `${STRAPI_URL}${image.url}`,
    }));

    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/categories?populate=*`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const json: StrapiCategoryResponse = await response.json();

    if (!json.data || json.data.length === 0) {
      console.warn("No categories found");
      return [];
    }

    const categories = json.data.map((category) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.image?.url
        ? `${STRAPI_URL}${category.image.url}`
        : "/placeholder-category.jpg",
    }));

    console.log(
      `Fetched ${categories.length} categories:`,
      categories.map((c) => c.name)
    );
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);

    return [
      { id: 1, name: "CARPET", imageUrl: "/placeholder-category.jpg" },
      { id: 2, name: "RUG", imageUrl: "/placeholder-category.jpg" },
      { id: 3, name: "KARPET MASJID", imageUrl: "/placeholder-category.jpg" },
      { id: 4, name: "KARPET KANTOR", imageUrl: "/placeholder-category.jpg" },
      { id: 5, name: "KARPET HOTEL", imageUrl: "/placeholder-category.jpg" },
      { id: 6, name: "SAJADAH ROLL", imageUrl: "/placeholder-category.jpg" },
    ];
  }
}

// 🔥 INI YANG LU HARUS FIX - TAMBAH isBestSeller MAPPING
export async function getProductsByCategory(
  categoryName: string
): Promise<Product[]> {
  try {
    console.log(`Fetching products for category: "${categoryName}"`);

    const query = new URLSearchParams({
      populate: "*",
      "filters[categories][name][$eq]": categoryName,
      // 🔥 REVERT: Biarkan client-side yang sorting, server-side tidak reliable
      "sort[0]": "id:asc",
    }).toString();

    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?${query}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const json: StrapiProductListResponse = await response.json();

    if (!json.data || json.data.length === 0) {
      console.warn(`No products found for category: ${categoryName}`);
      return [];
    }

    // 🚨 INI YANG KURANG - MAP isBestSeller
    const products = json.data.map((product) => ({
      id: product.id,
      name: product.name || "Untitled Product",
      description: product.deskripsi || null,
      images:
        product.images?.map((img) => ({
          id: img.id,
          url: `${STRAPI_URL}${img.url}`,
        })) || [],
      categories: product.categories || [],
      isBestSeller: product.isBestSeller === true, // 🔥 FIX: Explicit boolean check
    }));

    console.log(
      `Found ${products.length} products for category: ${categoryName}`,
      products.map(p => ({ name: p.name, isBestSeller: p.isBestSeller }))
    );
    return products;
  } catch (error) {
    console.error(
      `Error fetching products for category ${categoryName}:`,
      error
    );
    return [];
  }
}

// 🔥 FIX JUGA DI getProductById
export async function getProductById(
  id: string | number
): Promise<Product | null> {
  try {
    const query = new URLSearchParams({
      "filters[id][$eq]": String(id),
      populate: "*",
    }).toString();

    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?${query}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    const json: StrapiProductListResponse = await response.json();

    if (!json.data || json.data.length === 0) {
      console.warn(`Product with ID ${id} not found`);
      return null;
    }

    const productData = json.data[0];

    return {
      id: productData.id,
      name: productData.name || "Untitled Product",
      description: productData.deskripsi || null,
      images:
        productData.images?.map((img) => ({
          id: img.id,
          url: `${STRAPI_URL}${img.url}`,
        })) || [],
      categories: productData.categories || [],
      isBestSeller: productData.isBestSeller === true, // 🔥 FIX: Explicit boolean check
    };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

export async function getPortfolioProjects(): Promise<
  { id: number; title: string; imageUrl: string }[]
> {
  try {
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/portofolios?populate=*`,
      {
        next: { revalidate: 600 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch portfolio projects: ${response.statusText}`
      );
    }

    const json = await response.json();

    if (!json.data || json.data.length === 0) {
      console.warn("No portfolio projects found");
      return [];
    }

    return json.data.map((project: any) => {
      let imageUrl = "/placeholder-portfolio.jpg";

      if (project.pict?.url) {
        imageUrl = `${STRAPI_URL}${project.pict.url}`;
      } else if (project.pict?.formats?.medium?.url) {
        imageUrl = `${STRAPI_URL}${project.pict.formats.medium.url}`;
      } else if (project.pict?.formats?.small?.url) {
        imageUrl = `${STRAPI_URL}${project.pict.formats.small.url}`;
      } else if (project.pict?.formats?.thumbnail?.url) {
        imageUrl = `${STRAPI_URL}${project.pict.formats.thumbnail.url}`;
      }

      return {
        id: project.id,
        title: project.title || "Untitled Project",
        imageUrl: imageUrl,
      };
    });
  } catch (error) {
    console.error("Error fetching portfolio projects:", error);
    return [];
  }
}