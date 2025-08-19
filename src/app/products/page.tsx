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
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square relative">
        <Image
          src={imageUrl}
          alt={`Gambar untuk kategori ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wider uppercase text-center leading-tight">
            {name}
          </h2>
        </div>
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
      {/* Navbar dengan Logo */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/icons/logo.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  
                />
              </Link>
            </div>
            {/* Bisa tambahin menu lain di sini */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Menu items bisa ditambahin di sini */}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner Section */}
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

      {/* Categories Grid */}
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Kategori Produk
          </h1>
          
          {/* Grid yang lebih clean - Mobile: 2 kolom, Tablet: 3 kolom, Desktop: 4 kolom */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  Kategori tidak ditemukan.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}