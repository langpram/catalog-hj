// src/app/products/page.tsx
"use client";
import { getBanners, getCategories } from "@/lib/api";
import { useState, useEffect } from "react";
import { Banner, Category } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
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

// Komponen Search Bar untuk Navbar
function NavbarSearchBar({ 
  searchTerm, 
  setSearchTerm, 
  categories 
}: { 
  searchTerm: string; 
  setSearchTerm: (term: string) => void;
  categories: Category[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Category[]>([]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm, categories]);

  const handleSuggestionClick = (category: Category) => {
    // Navigate to category page
    const slug = category.name.toLowerCase().replace(/\s+/g, "-");
    window.location.href = `/products/${slug}`;
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      // Navigate to first suggestion when Enter is pressed
      handleSuggestionClick(filteredSuggestions[0]);
    }
  };

  return (
    <div className="relative w-full max-w-sm md:max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          onFocus={() => searchTerm.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSuggestionClick(category)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm transition-colors"
            >
              <div className="flex-shrink-0">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={24}
                  height={24}
                  className="rounded object-cover"
                />
              </div>
              <span className="text-gray-900 dark:text-white truncate">{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Halaman Utama Kategori - UBAH JADI CLIENT SIDE
export default function CategoryPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories berdasarkan search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Navbar dengan Logo dan Search */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/icons/logo.png"
                  alt="Logo"
                  width={120}
                  height={120}
                />
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 justify-center px-6">
              <NavbarSearchBar 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
              />
            </div>

            {/* Right side menu - bisa ditambah menu lain */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {/* Additional menu items bisa ditambah di sini */}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Full width di bawah navbar */}
          <div className="md:hidden px-0 pb-4">
            <NavbarSearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
            />
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Kategori Produk
          </h1>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredCategories.length > 0 
                  ? `Menampilkan ${filteredCategories.length} kategori untuk "${searchTerm}"`
                  : `Tidak ada kategori yang ditemukan untuk "${searchTerm}"`
                }
              </p>
            </div>
          )}
          
          {/* Grid yang lebih clean - Mobile: 2 kolom, Tablet: 3 kolom, Desktop: 4 kolom */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  imageUrl={category.imageUrl}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm ? "Kategori tidak ditemukan." : "Kategori tidak ditemukan."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tampilkan Semua Kategori
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}