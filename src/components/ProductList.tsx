// src/components/ProductList.tsx
"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import ProductPageHeader from "./ProductPageHeader";
import ProductCard from "./ProductCard";

interface ProductListProps {
  initialProducts: Product[];
  categoryName: string;
}

export default function ProductList({
  initialProducts,
  categoryName,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return initialProducts;
    }
    return initialProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProductPageHeader
        categoryName={categoryName}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white text-center">
            Produk Kategori: {categoryName}
          </h1>

          {/* Info hasil pencarian */}
          {searchQuery && (
            <div className="mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredProducts.length > 0
                  ? `Menampilkan ${filteredProducts.length} produk untuk "${searchQuery}"`
                  : `Tidak ada produk yang ditemukan untuk "${searchQuery}"`}
              </p>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? `Produk tidak ditemukan untuk pencarian "${searchQuery}".`
                  : "Produk tidak ditemukan untuk kategori ini."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tampilkan Semua Produk
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
