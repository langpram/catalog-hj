// src/app/product/[id]/page.tsx

import { getProductById, getProductsByCategory } from "@/lib/api";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { marked } from "marked";

//                                       👇 PERUBAHAN DI SINI: params adalah sebuah Promise
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  let otherProducts: Product[] = [];
  if (product.categories && product.categories.length > 0) {
    const categoryName = product.categories[0].name;
    const allProductsInCategory = await getProductsByCategory(categoryName);
    otherProducts = allProductsInCategory
      .filter((p) => p.id !== product.id)
      .slice(0, 3);
  }

  const descriptionHtml = product.description
    ? await marked.parse(product.description)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        <BackButton />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <ProductImageGallery images={product.images} productName={product.name} />
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
              <p className="text-gray-500 italic">Tidak ada deskripsi untuk produk ini.</p>
            )}
          </div>
        </div>

        {otherProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold text-center mb-8">
              Produk Lainnya
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherProducts.map((otherProduct) => (
                <ProductCard key={otherProduct.id} product={otherProduct} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}