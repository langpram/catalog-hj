// src/app/products/page.tsx

import { getBanners, getCategories } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Komponen Card untuk setiap Kategori
function CategoryCard({ name, imageUrl }: {name: string; imageUrl: string }) {
  // Kita akan buat slug dari nama kategori untuk URL, atau bisa gunakan ID
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link href={`/products/${slug}`} className="group relative block overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt={`Gambar untuk kategori ${name}`}
        width={400}
        height={400}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      {/* Overlay hitam transparan */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Nama Kategori */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase text-center p-4">
          {name}
        </h2>
      </div>
    </Link>
  );
}

// Halaman Utama Kategori
export default async function CategoryPage() {
  // Ambil data banner dan kategori secara paralel
  const [banners, categories] = await Promise.all([
    getBanners(),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="p-4 md:p-6 lg:p-8">
        {banners.length > 0 ? (
          <Carousel
            opts={{ loop: true }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="aspect-video md:aspect-[2.4/1] relative overflow-hidden rounded-xl">
                    <Image
                      src={banner.imageUrl}
                      alt={`Banner image ${banner.id}`}
                      fill
                      className="object-cover"
                      priority // Prioritaskan gambar pertama di banner
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        ) : (
          <div className="aspect-video md:aspect-[2.4/1] bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Banner tidak tersedia</p>
          </div>
        )}
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                imageUrl={category.imageUrl}
              />
            ))
          ) : (
             <p className="col-span-full text-center text-gray-500">
                Kategori tidak ditemukan.
             </p>
          )}
        </div>
      </main>
    </div>
  );
}