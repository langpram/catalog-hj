// src/app/products/[slug]/page.tsx

import { getProductsByCategory, getCategories } from "@/lib/api";
import ProductList from "@/components/ProductList";
import { notFound } from "next/navigation";
import { Metadata } from "next";

function formatCategoryName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Generate static params dari Strapi API
export async function generateStaticParams() {
  try {
    // Ambil kategori dari Strapi
    const categories = await getCategories();
    
    // Convert nama kategori jadi slug
    const categoryParams = categories.map((category) => ({
      slug: slugify(category.name),
    }));

    // Fallback manual kalau API gagal
    const fallbackCategories = [
      "carpet",
      "rug", 
      "karpet-masjid",
      "karpet-kantor", 
      "karpet-hotel",
      "sajadah-roll",
    ];

    // Combine API results dengan fallback
    const allSlugs = [
      ...categoryParams,
      ...fallbackCategories.map(slug => ({ slug }))
    ];

    // Remove duplicates
    const uniqueSlugs = allSlugs.filter((item, index, self) => 
      index === self.findIndex(t => t.slug === item.slug)
    );

    console.log('Generated static params:', uniqueSlugs);
    return uniqueSlugs;

  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    
    // Fallback ke kategori manual
    return [
      { slug: "carpet" },
      { slug: "rug" },
      { slug: "karpet-masjid" },
      { slug: "karpet-kantor" },
      { slug: "karpet-hotel" },
      { slug: "sajadah-roll" },
    ];
  }
}

// Generate metadata untuk SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = formatCategoryName(slug);

  return {
    title: `${categoryName} - HJKARPET`,
    description: `Koleksi ${categoryName.toLowerCase()} berkualitas tinggi dari HJKARPET. Temukan produk terbaik untuk kebutuhan Anda.`,
    openGraph: {
      title: `${categoryName} - HJKARPET`,
      description: `Koleksi ${categoryName.toLowerCase()} berkualitas tinggi`,
      type: "website",
    },
  };
}

// Disable dynamic params untuk static export
export const dynamicParams = false;

export default async function ProductListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  try {
    const categoryName = formatCategoryName(slug);
    console.log(`Fetching products for category: ${categoryName}`);
    
    const allProducts = await getProductsByCategory(categoryName);
    
    // Kalau tidak ada produk, tetap render tapi dengan empty state
    if (!allProducts || allProducts.length === 0) {
      console.warn(`No products found for category: ${categoryName}`);
      
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">
              Maaf, saat ini tidak ada produk dalam kategori {categoryName.toLowerCase()}.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Semua Produk
            </a>
          </div>
        </div>
      );
    }

    return (
      <ProductList 
        initialProducts={allProducts} 
        categoryName={categoryName} 
      />
    );

  } catch (error) {
    console.error(`Error in ProductListPage for slug ${slug}:`, error);
    
    // Redirect ke 404 kalau ada error
    notFound();
  }
}