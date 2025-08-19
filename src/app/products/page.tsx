// src/app/products/page.tsx
"use client"; // ← Tambah ini

import { getBanners, getCategories } from "@/lib/api";
import { useState, useEffect } from "react";
import { Banner, Category } from "@/lib/types";
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
function CategoryCard({ name, imageUrl }: { name: string; imageUrl: string }) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      href={`/products/${slug}`}
      className="group relative block overflow-hidden rounded-lg"
    >
      <Image
        src={imageUrl}
        alt={`Gambar untuk kategori ${name}`}
        width={400}
        height={400}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase text-center p-4">
          {name}
        </h2>
      </div>
    </Link>
  );
}

// Halaman Utama Kategori - UBAH JADI CLIENT SIDE
export default function CategoryPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔥 Fetching banners and categories...");

        const [bannersData, categoriesData] = await Promise.all([
          getBanners(),
          getCategories(),
        ]);

        console.log("📦 Banners:", bannersData);
        console.log("📦 Categories:", categoriesData);

        setBanners(bannersData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="p-4 md:p-6 lg:p-8">
        {banners.length > 0 ? (
          <Carousel opts={{ loop: true }} className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {banners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="aspect-video md:aspect-[2.4/1] relative overflow-hidden rounded-xl">
                    <Image
                      src={banner.imageUrl}
                      alt={`Banner image ${banner.id}`}
                      fill
                      className="object-cover"
                      priority
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
