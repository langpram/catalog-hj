"use client";

import ProductList from "@/components/ProductList";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useEffect, useState, use, useRef } from "react";
import { Product, Category } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

function formatCategoryName(slug: string): string {
  return slug.replace(/-/g, " ").toUpperCase();
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// ── Search Bar (sama style dengan ProductList) ─────────────────
function SubCategorySearchBar({
  searchTerm,
  setSearchTerm,
  subCategories,
  categoryName,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  subCategories: Category[];
  categoryName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Category[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = subCategories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, subCategories]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (cat: Category) => {
    setSearchTerm("");
    setIsOpen(false);
    router.push(`/products/${slugify(cat.name)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) handleSuggestionClick(filteredSuggestions[selectedIndex]);
        else if (filteredSuggestions.length > 0) handleSuggestionClick(filteredSuggestions[0]);
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder={`Cari di ${categoryName}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.length > 0 && filteredSuggestions.length > 0) setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => { setSearchTerm(""); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => handleSuggestionClick(cat)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2 text-left flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex-shrink-0">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={24}
                  height={24}
                  className="rounded object-cover"
                />
              </div>
              <span className="text-gray-900 dark:text-white truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-category Card ──────────────────────────────────────────
function SubCategoryCard({ name, imageUrl }: { name: string; imageUrl: string }) {
  return (
    <Link
      href={`/products/${slugify(name)}`}
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-square relative">
        <Image
          src={imageUrl}
          alt={`Gambar untuk kategori ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wider uppercase text-center leading-tight">
            {name}
          </h2>
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function ProductListPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: offlineData, isLoading, error } = useOfflineData();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>("");
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (offlineData) {
      const formattedCategoryName = formatCategoryName(slug);
      setCategoryName(formattedCategoryName);

      const currentCategory = offlineData.categories.find(
        (c) => c.name.toUpperCase() === formattedCategoryName
      );

      if (currentCategory?.children && currentCategory.children.length > 0) {
        setSubCategories(currentCategory.children);
        setProducts([]);
      } else {
        setSubCategories([]);
        let categoryProducts = offlineData.products[formattedCategoryName] || [];
        categoryProducts.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return a.id - b.id;
        });
        setProducts(categoryProducts);
      }
    }
  }, [offlineData, slug]);

  // Filter sub-kategori berdasarkan search
  const filteredSubCategories = subCategories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
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

  // ── CASE 1: Punya sub-kategori ─────────────────────────────────
  if (subCategories.length > 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        {/* Navbar — sama persis dengan ProductList */}
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Home icon */}
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
              >
                <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>

              {/* Search bar — desktop */}
              <div className="hidden md:flex flex-1 justify-center px-6">
                <SubCategorySearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  subCategories={subCategories}
                  categoryName={categoryName}
                />
              </div>

              {/* Tombol Kembali */}
              <Link
                href="/products"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </Link>
            </div>

            {/* Search bar — mobile */}
            <div className="md:hidden pb-3">
              <SubCategorySearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                subCategories={subCategories}
                categoryName={categoryName}
              />
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {categoryName}
            </h1>

            {/* Search result info */}
            {searchTerm && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {filteredSubCategories.length > 0
                  ? `Menampilkan ${filteredSubCategories.length} kategori untuk "${searchTerm}"`
                  : `Tidak ada kategori untuk "${searchTerm}"`}
              </p>
            )}
            {!searchTerm && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
                Pilih sub-kategori di bawah
              </p>
            )}

            {filteredSubCategories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredSubCategories.map((subCat) => (
                  <SubCategoryCard
                    key={subCat.id}
                    name={subCat.name}
                    imageUrl={subCat.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Kategori tidak ditemukan.</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Tampilkan Semua
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── CASE 2: Empty state ────────────────────────────────────────
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
              <Home className="h-5 w-5 text-gray-700" />
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>
          <h2 className="text-xl font-semibold mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">
            Maaf, saat ini tidak ada produk dalam kategori {categoryName.toLowerCase()}.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    );
  }

  // ── CASE 3: Ada produk ─────────────────────────────────────────
  return <ProductList initialProducts={products} categoryName={categoryName} />;
}