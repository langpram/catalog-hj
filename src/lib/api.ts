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

const STRAPI_URL = "https://turgent-annis-groundedly.ngrok-free.dev";
const FETCH_TIMEOUT = 10000;

// ===============================================
// HELPER FUNCTIONS
// ===============================================

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  const finalUrl = url + (url.includes('?') ? '&' : '?') + 'ngrok-skip-browser-warning=true';

  try {
    const response = await fetch(finalUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'ngrok-skip-browser-warning': 'true',   // ← pakai header, bukan cuma query
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${STRAPI_URL}${imagePath}`;
}

// ===============================================
// BANNERS
// ===============================================

export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/hero-banner-kategoris?populate=*`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`Failed to fetch banners: ${response.statusText}`);
    const json: StrapiBannerResponse = await response.json();
    if (!json.data?.[0]?.images) return [];
    return json.data[0].images.map((image) => ({
      id: image.id,
      imageUrl: normalizeImageUrl(image.url),
    }));
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
      `${STRAPI_URL}/api/categories?populate[image]=true&populate[children][populate][0]=image&populate[parent]=true`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
    const json: StrapiCategoryResponse = await response.json();
    if (!json.data || json.data.length === 0) return [];

    const allCategories: Category[] = json.data.map((category) => {
      let childrenArray: Category[] = [];
      if (category.children) {
        const rawChildren = Array.isArray(category.children)
          ? category.children
          : [category.children];
        childrenArray = rawChildren.map((child) => ({
          id: child.id,
          name: child.name,
          imageUrl: child.image?.url ? normalizeImageUrl(child.image.url) : "/placeholder-category.jpg",
          children: [],
          parent: { id: category.id, name: category.name },
        }));
      }
      return {
        id: category.id,
        name: category.name,
        imageUrl: category.image?.url ? normalizeImageUrl(category.image.url) : "/placeholder-category.jpg",
        children: childrenArray,
        parent: category.parent ? { id: category.parent.id, name: category.parent.name } : null,
      };
    });

    const ORDER = [
      "KARPET CUSTOM", "SAJADAH ROLL", "KARPET TILE", "KARPET METERAN",
      "ANEKA SAJADAH", "PERMADANI", "WALLPAPER", "FIBERGLASS", "INTERIOR",
    ];
    allCategories.sort((a, b) => {
      const posA = ORDER.indexOf(a.name.toUpperCase());
      const posB = ORDER.indexOf(b.name.toUpperCase());
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });

    return allCategories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return [];
  }
}

// ===============================================
// PRODUCTS
// ===============================================

export async function getProductsByCategory(categoryName: string): Promise<Product[]> {
  try {
    const query = new URLSearchParams({
      populate: "*",
      "filters[categories][name][$eq]": categoryName,
      "sort[0]": "id:asc",
    }).toString();
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?${query}`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);
    const json: StrapiProductListResponse = await response.json();
    if (!json.data || json.data.length === 0) return [];
    return json.data.map((product) => ({
      id: product.id,
      name: product.name || "Untitled Product",
      description: product.deskripsi || null,
      images: product.images?.map((img) => ({ id: img.id, url: normalizeImageUrl(img.url) })) || [],
      categories: product.categories || [],
      isBestSeller: product.isBestSeller === true,
    }));
  } catch (error) {
    console.error(`❌ Error fetching products for category ${categoryName}:`, error);
    return [];
  }
}

export async function getProductById(id: string | number): Promise<Product | null> {
  try {
    const query = new URLSearchParams({
      "filters[id][$eq]": String(id),
      populate: "*",
    }).toString();
    const response = await fetchWithTimeout(
      `${STRAPI_URL}/api/products?${query}`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) throw new Error(`Failed to fetch product: ${response.statusText}`);
    const json: StrapiProductListResponse = await response.json();
    if (!json.data || json.data.length === 0) return null;
    const p = json.data[0];
    return {
      id: p.id,
      name: p.name || "Untitled Product",
      description: p.deskripsi || null,
      images: p.images?.map((img) => ({ id: img.id, url: normalizeImageUrl(img.url) })) || [],
      categories: p.categories || [],
      isBestSeller: p.isBestSeller === true,
    };
  } catch (error) {
    console.error(`❌ Error fetching product with ID ${id}:`, error);
    return null;
  }
}

// ===============================================
// PORTFOLIO - Strapi v5 (flat structure)
// ===============================================

function processPortfolioData(project: any): Portfolio {
  const images: string[] = [];
  if (Array.isArray(project.pict)) {
    project.pict.forEach((pic: any) => {
      if (pic?.url) images.push(normalizeImageUrl(pic.url));
    });
  }
  return {
    id: project.id,
    title: project.title || "Untitled Project",
    slug: project.slug || `project-${project.id}`,
    description: project.Description || project.description || "",
    pict: images,
    imageUrl: images[0] || "/placeholder-portfolio.jpg",
    Big_project: project.Big_project === true,
    Portfolio_Category: project.Portfolio_Category || undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function getPortfolioProjects(): Promise<Portfolio[]> {
  try {
    const endpoints = [
      `${STRAPI_URL}/api/portfolios?populate=*`,
      `${STRAPI_URL}/api/portofolios?populate=*`,
      `${STRAPI_URL}/api/portfolio?populate=*`,
      `${STRAPI_URL}/api/portofolio?populate=*`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, { next: { revalidate: 600 } });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const portfolios = data.data.map((p: any) => processPortfolioData(p));
            return portfolios.sort((a: Portfolio, b: Portfolio) => {
              if (a.Big_project && !b.Big_project) return -1;
              if (!a.Big_project && b.Big_project) return 1;
              return a.id - b.id;
            });
          }
        }
      } catch (err) {
        continue;
      }
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching portfolio projects:", error);
    return [];
  }
}

export async function getPortfolioBySlug(slug: string | number): Promise<Portfolio | null> {
  try {
    const allEndpoints = [
      `${STRAPI_URL}/api/portfolios?populate=*&filters[slug][$eq]=${slug}`,
      `${STRAPI_URL}/api/portofolios?populate=*&filters[slug][$eq]=${slug}`,
      `${STRAPI_URL}/api/portfolios?populate=*&filters[id][$eq]=${slug}`,
      `${STRAPI_URL}/api/portofolios?populate=*&filters[id][$eq]=${slug}`,
    ];

    for (const endpoint of allEndpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, { next: { revalidate: 300 } });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) return processPortfolioData(data.data[0]);
        }
      } catch (err) {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching portfolio with slug ${slug}:`, error);
    return null;
  }
}