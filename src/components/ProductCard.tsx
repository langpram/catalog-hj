// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { ImageIcon } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  // Ambil gambar pertama dari array images sebagai thumbnail
  const thumbnailUrl = product.images.length > 0 ? product.images[0].url : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square relative">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Gambar produk ${product.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {/* Overlay hitam dengan efek hover */}
        {thumbnailUrl && (
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
        )}
        {/* Teks tengah */}
        {thumbnailUrl && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wider uppercase text-center leading-tight">
              {product.name}
            </h3>
          </div>
        )}
      </div>
    </Link>
  );
}
