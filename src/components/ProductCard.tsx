// src/components/ProductCard.tsx
import Image from "next/image";
import { Product } from "@/lib/types";
import { ImageIcon } from "lucide-react";
import Link from "next/link";

export default function ProductCard({ product }: { product: Product }) {
  // Ambil gambar pertama dari array images sebagai thumbnail
  const thumbnailUrl = product.images.length > 0 ? product.images[0].url : null;
  
  return (
    <Link href={`/product/${product.id}`} className="group block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Gambar produk ${product.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-900">
        <h3 className="font-semibold truncate" title={product.name}>
          {product.name}
        </h3>
      </div>
    </Link>
  );
}