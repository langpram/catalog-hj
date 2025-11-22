// src/app/product/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { marked } from "marked";
import { useOfflineData } from "@/hooks/useOfflineData";

// Helper function untuk sort products (best seller duluan)
const sortProductsByBestSeller = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    const aIsBest = a.isBestSeller === true ? 1 : 0;
    const bIsBest = b.isBestSeller === true ? 1 : 0;
    
    if (bIsBest !== aIsBest) {
      return bIsBest - aIsBest;
    }
    
    return a.id - b.id;
  });
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: offlineData, isLoading, error, isOnline } = useOfflineData();
  const [product, setProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [descriptionHtml, setDescriptionHtml] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (offlineData) {
      // Cari produk berdasarkan ID dari semua kategori
      let foundProduct: Product | null = null;
      let categoryName = "";
      const productId = parseInt(id, 10);
      
      // Cari produk di semua kategori
      Object.entries(offlineData.products).forEach(([catName, products]) => {
        const found = products.find(p => p.id === productId);
        if (found) {
          foundProduct = found;
          categoryName = catName;
        }
      });

      if (foundProduct) {
        // PROSES GAMBAR SEPERTI DI API
        if (foundProduct.images) {
          foundProduct.images = foundProduct.images.map((img: any) => {
            if (typeof img === 'string') {
              return img.startsWith('http') ? img : `https://strapi.fairuzulum.me${img}`;
            } else if (img && img.url) {
              return img.url.startsWith('http') ? img.url : `https://strapi.fairuzulum.me${img.url}`;
            } else if (img && img.formats && img.formats.medium) {
              const url = img.formats.medium.url || img.url;
              return url.startsWith('http') ? url : `https://strapi.fairuzulum.me${url}`;
            }
            return img;
          });
        }
        
        setProduct(foundProduct);
        
        // Cari produk lain dalam kategori yang sama
        if (categoryName) {
          const categoryProducts = offlineData.products[categoryName] || [];
          
          // SORT BIAR BEST SELLER DULUAN
          const others = sortProductsByBestSeller(categoryProducts)
            .filter(p => p.id !== productId)
            .slice(0, 3);
          
          // Process images for other products too
          const processedOthers = others.map(otherProduct => ({
            ...otherProduct,
            images: otherProduct.images?.map((img: any) => {
              if (typeof img === 'string') {
                return img.startsWith('http') ? img : `https://strapi.fairuzulum.me${img}`;
              } else if (img && img.url) {
                return img.url.startsWith('http') ? img.url : `https://strapi.fairuzulum.me${img.url}`;
              }
              return img;
            })
          }));
          setOtherProducts(processedOthers);
        }

        // Parse deskripsi markdown
        if (foundProduct.description) {
          const parseDescription = async () => {
            try {
              const html = await marked.parse(foundProduct.description);
              setDescriptionHtml(html);
            } catch (error) {
              console.error('Error parsing markdown:', error);
              setDescriptionHtml(foundProduct.description);
            }
          };
          parseDescription();
        }
      }
    }
  }, [offlineData, id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!product && offlineData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Button */}
          <div className="mb-6">
            <a 
              href="/products" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back
            </a>
          </div>
          
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Produk Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-6">Produk dengan ID {id} tidak ditemukan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <div className="mb-6">
          <a 
            href="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </a>
        </div>
        
        {product && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image Gallery */}
              <div>
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-white rounded-lg overflow-hidden">
                      <img 
                        src={product.images[currentImageIndex]} 
                        alt={`${product.name} - ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`aspect-square rounded-lg overflow-hidden ${
                              currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <img 
                              src={image} 
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center">
                    <span className="text-gray-500 text-6xl">📦</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-col pt-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
                  {product.name}
                </h1>
                {descriptionHtml ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    Tidak ada deskripsi untuk produk ini.
                  </p>
                )}
              </div>
            </div>

            {/* Other Products */}
            {otherProducts.length > 0 && (
              <div className="mt-16 pt-8 border-t">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Produk Lainnya
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {otherProducts.map((otherProduct) => (
                    <a
                      key={otherProduct.id}
                      href={`/product/${otherProduct.id}`}
                      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="aspect-square relative">
                        {otherProduct.images && otherProduct.images.length > 0 ? (
                          <>
                            <img 
                              src={otherProduct.images[0]} 
                              alt={`Gambar produk ${otherProduct.name}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            {/* Overlay hitam dengan efek hover */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                            {/* Teks tengah */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wider uppercase text-center leading-tight">
                                {otherProduct.name}
                              </h3>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                            <div className="w-12 h-12 text-gray-400 flex items-center justify-center text-2xl">
                              📷
                            </div>
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}