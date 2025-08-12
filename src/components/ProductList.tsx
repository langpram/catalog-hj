// src/components/ProductList.tsx
'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import ProductPageHeader from './ProductPageHeader';
import ProductCard from './ProductCard';

interface ProductListProps {
  initialProducts: Product[];
  categoryName: string;
}

export default function ProductList({ initialProducts, categoryName }: ProductListProps) {
  // State untuk menyimpan query pencarian dari user
  const [searchQuery, setSearchQuery] = useState('');

  // Memfilter produk berdasarkan searchQuery
  // useMemo digunakan agar proses filter tidak diulang pada setiap render,
  // hanya jika initialProducts atau searchQuery berubah.
  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return initialProducts;
    }
    return initialProducts.filter(product =>
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
          <h1 className="text-3xl font-bold mb-6">
            Produk Kategori: {categoryName}
          </h1>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500">
                Produk tidak ditemukan untuk pencarian {searchQuery}.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}