// src/app/products/[slug]/page.tsx
"use client";

import ProductList from "@/components/ProductList";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useEffect, useState, use } from "react";
import { Product } from "@/lib/types";

function formatCategoryName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Tidak perlu generateStaticParams karena kita menggunakan data offline
// dan halaman ini sekarang adalah client component

// Metadata sekarang diatur secara statis karena ini adalah client component

export default function ProductListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: offlineData, isLoading, error } = useOfflineData();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (offlineData) {
      const formattedCategoryName = formatCategoryName(slug);
      setCategoryName(formattedCategoryName);
      
      // Cari produk berdasarkan kategori dari data offline
      const categoryProducts = offlineData.products[formattedCategoryName] || [];
      setProducts(categoryProducts);
    }
  }, [offlineData, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Kalau tidak ada produk, tetap render tapi dengan empty state
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{categoryName}</h1>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">
            Maaf, saat ini tidak ada produk dalam kategori{" "}
            {categoryName.toLowerCase()}.
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
    <ProductList initialProducts={products} categoryName={categoryName} />
  );
}
