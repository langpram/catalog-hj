// src/app/products/[slug]/page.tsx

import { getProductsByCategory } from "@/lib/api";
import ProductList from "@/components/ProductList";

function formatCategoryName(slug: string): string {
  return slug.replace(/-/g, ' ').toUpperCase();
}

//                                         👇 PERUBAHAN DI SINI: params adalah sebuah Promise
export default async function ProductListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const categoryName = formatCategoryName(slug);
  const allProducts = await getProductsByCategory(categoryName);

  return (
    <ProductList initialProducts={allProducts} categoryName={categoryName} />
  );
}