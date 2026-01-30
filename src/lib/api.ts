// src/lib/api.ts - UPDATED DENGAN PORTFOLIO_CATEGORY PARSING

import {
  Banner,
  Category,
  Product,
  Portfolio,
  StrapiBannerResponse,
  StrapiCategoryResponse,
  StrapiProductListResponse,
  StrapiPortfolioResponse,
} from "@/lib/types";

const STRAPI_URL = "https://strapi.fairuzulum.me";
const FETCH_TIMEOUT = 10000;

// ===============================================
// HELPER FUNCTIONS
// ===============================================

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

// 🔥 Helper untuk normalize image URLs
function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `${STRAPI_URL}${imagePath}`;
}

// ===============================================
// BANNERS
// ===============================================

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
      imageUrl: normalizeImageUrl(image.url),
    }));

    return banners;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

// ===============================================
// CATEGORIES
// ===============================================

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
        ? normalizeImageUrl(category.image.url)
        : "/placeholder-category.jpg",
    }));

    console.log(
      `✅ Fetched ${categories.length} categories:`,
      categories.map((c) => c.name)
    );
    return categories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);

    // Fallback data
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

// ===============================================
// PRODUCTS
// ===============================================

export async function getProductsByCategory(
  categoryName: string
): Promise<Product[]> {
  try {
    console.log(`🔄 Fetching products for category: "${categoryName}"`);

    const query = new URLSearchParams({
      populate: "*",
      "filters[categories][name][$eq]": categoryName,
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

    const products = json.data.map((product) => ({
      id: product.id,
      name: product.name || "Untitled Product",
      description: product.deskripsi || null,
      images:
        product.images?.map((img) => ({
          id: img.id,
          url: normalizeImageUrl(img.url),
        })) || [],
      categories: product.categories || [],
      isBestSeller: product.isBestSeller === true,
    }));

    console.log(
      `✅ Found ${products.length} products for category: ${categoryName}`,
      products.map((p) => ({
        id: p.id,
        name: p.name,
        isBestSeller: p.isBestSeller,
      }))
    );
    return products;
  } catch (error) {
    console.error(
      `❌ Error fetching products for category ${categoryName}:`,
      error
    );
    return [];
  }
}

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
          url: normalizeImageUrl(img.url),
        })) || [],
      categories: productData.categories || [],
      isBestSeller: productData.isBestSeller === true,
    };
  } catch (error) {
    console.error(`❌ Error fetching product with ID ${id}:`, error);
    return null;
  }
}

// ===============================================
// PORTFOLIO - 🔥 WITH PORTFOLIO_CATEGORY SUPPORT
// ===============================================

export async function getPortfolioProjects(): Promise<Portfolio[]> {
  try {
    console.log("🔄 Fetching portfolio projects...");

    // Try multiple endpoint variations
    const endpoints = [
      `${STRAPI_URL}/api/portfolios?populate=*`,
      `${STRAPI_URL}/api/portofolios?populate=*`,
      `${STRAPI_URL}/api/portfolio?populate=*`,
      `${STRAPI_URL}/api/portofolio?populate=*`,
    ];

    let json: StrapiPortfolioResponse | null = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`  Trying endpoint: ${endpoint}`);
        const response = await fetchWithTimeout(endpoint, {
          next: { revalidate: 600 },
        });

        if (response.ok) {
          json = await response.json();
          if (json.data && json.data.length > 0) {
            console.log(`✅ Portfolio endpoint found: ${endpoint}`);
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    if (!json || !json.data || json.data.length === 0) {
      console.warn("No portfolio projects found in any endpoint");
      return [];
    }

    const portfolios = json.data.map((project: any) => {
      const attributes = project.attributes || project;

      // Extract images dari pict
      const images: string[] = [];

      if (attributes.pict?.data) {
        const pictArray = Array.isArray(attributes.pict.data)
          ? attributes.pict.data
          : [attributes.pict.data];

        pictArray.forEach((pic: any) => {
          if (pic?.attributes?.url) {
            images.push(normalizeImageUrl(pic.attributes.url));
          }
        });
      }

      if (images.length === 0 && attributes.pict) {
        const pictUrl =
          attributes.pict.url ||
          attributes.pict.formats?.medium?.url ||
          attributes.pict.formats?.small?.url;

        if (pictUrl) {
          images.push(normalizeImageUrl(pictUrl));
        }
      }

      return {
        id: project.id,
        title: attributes.title || "Untitled Project",
        slug: attributes.slug || `project-${project.id}`,
        description: attributes.Description || attributes.description || "",
        pict: images,
        imageUrl: images[0] || "/placeholder-portfolio.jpg",
        Big_project: attributes.Big_project === true,
        Portfolio_Category: attributes.Portfolio_Category || undefined, // 🔥 Parse enumeration
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt,
      };
    });

    // 🔥 SORT: Big_project true duluan
    const sorted = portfolios.sort((a, b) => {
      if (a.Big_project && !b.Big_project) return -1;
      if (!a.Big_project && b.Big_project) return 1;
      return a.id - b.id;
    });

    console.log(
      `✅ Fetched ${portfolios.length} portfolio projects`,
      sorted.map((p) => ({
        id: p.id,
        title: p.title,
        Big_project: p.Big_project,
        category: p.Portfolio_Category,
        imageCount: p.pict.length,
      }))
    );

    return sorted;
  } catch (error) {
    console.error("❌ Error fetching portfolio projects:", error);
    return [];
  }
}

// 🔥 Get single portfolio by slug or ID
export async function getPortfolioBySlug(
  slug: string | number
): Promise<Portfolio | null> {
  try {
    console.log(`🔄 Fetching portfolio with slug/ID: ${slug}`);

    const endpoints = [
      `${STRAPI_URL}/api/portfolios?populate=*&filters[slug][$eq]=${slug}`,
      `${STRAPI_URL}/api/portofolios?populate=*&filters[slug][$eq]=${slug}`,
      `${STRAPI_URL}/api/portfolio?populate=*&filters[slug][$eq]=${slug}`,
      `${STRAPI_URL}/api/portofolio?populate=*&filters[slug][$eq]=${slug}`,
    ];

    let json: StrapiPortfolioResponse | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, {
          next: { revalidate: 300 },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            json = data;
            break;
          }
        }
      } catch (err) {
        continue;
      }
    }

    // Fallback to ID
    if (!json || !json.data || json.data.length === 0) {
      const idEndpoints = [
        `${STRAPI_URL}/api/portfolios?populate=*&filters[id][$eq]=${slug}`,
        `${STRAPI_URL}/api/portofolios?populate=*&filters[id][$eq]=${slug}`,
        `${STRAPI_URL}/api/portfolio?populate=*&filters[id][$eq]=${slug}`,
        `${STRAPI_URL}/api/portofolio?populate=*&filters[id][$eq]=${slug}`,
      ];

      for (const endpoint of idEndpoints) {
        try {
          const response = await fetchWithTimeout(endpoint, {
            next: { revalidate: 300 },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              json = data;
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }
    }

    if (!json || !json.data || json.data.length === 0) {
      console.warn(`Portfolio with slug/ID ${slug} not found`);
      return null;
    }

    return processPortfolioData(json.data[0]);
  } catch (error) {
    console.error(`❌ Error fetching portfolio with slug ${slug}:`, error);
    return null;
  }
}

// 🔥 Helper function to process portfolio data
function processPortfolioData(project: any): Portfolio {
  const attributes = project.attributes || project;
  const images: string[] = [];

  if (attributes.pict?.data) {
    const pictArray = Array.isArray(attributes.pict.data)
      ? attributes.pict.data
      : [attributes.pict.data];

    pictArray.forEach((pic: any) => {
      if (pic?.attributes?.url) {
        images.push(normalizeImageUrl(pic.attributes.url));
      }
    });
  }

  if (images.length === 0 && attributes.pict) {
    const pictUrl =
      attributes.pict.url ||
      attributes.pict.formats?.medium?.url ||
      attributes.pict.formats?.small?.url;

    if (pictUrl) {
      images.push(normalizeImageUrl(pictUrl));
    }
  }

  return {
    id: project.id,
    title: attributes.title || "Untitled Project",
    slug: attributes.slug || `project-${project.id}`,
    description: attributes.Description || attributes.description || "",
    pict: images,
    imageUrl: images[0] || "/placeholder-portfolio.jpg",
    Big_project: attributes.Big_project === true,
    Portfolio_Category: attributes.Portfolio_Category || undefined, // 🔥 Parse enumeration
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  };
}