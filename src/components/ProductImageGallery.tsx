// src/components/ProductImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { ImageIcon } from 'lucide-react';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

interface ProductImageGalleryProps {
  images: Product['images'];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  // === SOLUSI: Pindahkan semua Hooks ke atas ===
  const [isOpen, setIsOpen] = useState(false);
  // Default state diatur di sini, menggunakan gambar pertama jika ada
  const [selectedImage, setSelectedImage] = useState(images?.[0] || null);

  // Jika tidak ada gambar, tampilkan placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-20 h-20 text-gray-400" />
      </div>
    );
  }

  const slides = images.map(image => ({ src: image.url }));
  const currentImageIndex = images.findIndex(img => img.id === selectedImage?.id);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* GAMBAR UTAMA */}
        {selectedImage && (
          <div 
            className="aspect-square relative overflow-hidden rounded-xl border cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src={selectedImage.url}
              alt={`Gambar utama produk ${productName}`}
              fill
              className="object-cover transition-all duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        )}

        {/* DAFTAR THUMBNAIL */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="aspect-square relative overflow-hidden rounded-md cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail produk ${image.id}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
                <div
                  className={cn(
                    'absolute inset-0 border-2 rounded-md transition-all',
                    selectedImage?.id === image.id
                      ? 'border-blue-600'
                      : 'border-transparent hover:border-gray-400'
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={slides}
        index={currentImageIndex >= 0 ? currentImageIndex : 0}
        plugins={[Zoom, Thumbnails]}
      />
    </>
  );
}