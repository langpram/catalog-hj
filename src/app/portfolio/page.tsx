// src/app/portfolio/page.tsx - UPDATED DESIGN ELEGAN SEPERTI HJ KARPET

"use client";

import { useOfflineData } from "@/hooks/useOfflineData";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";

function getUniqueCategories(portfolios: any[]): string[] {
  const categories = new Set<string>();
  portfolios.forEach((p) => {
    if (p.Portfolio_Category) {
      categories.add(p.Portfolio_Category);
    }
  });
  return Array.from(categories).sort();
}

function PortfolioSearchBar({
  searchTerm,
  setSearchTerm,
  suggestions,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  suggestions: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = suggestions.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm, suggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
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
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          setSearchTerm(filteredSuggestions[selectedIndex]);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari judul proyek..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-10 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
          onFocus={() => {
            if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-2 shadow-xl z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((category, index) => (
            <button
              key={`${category}-${index}`}
              onClick={() => {
                setSearchTerm(category);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-gray-900 dark:text-white font-medium">{category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const { data: offlineData, isLoading, error } = useOfflineData();

  // Get sorted portfolios
  const projects = offlineData?.portfolios || [];

  // Get unique categories
  const allCategories = getUniqueCategories(projects);
  const allTitles = Array.from(new Set(projects.map((p: any) => p.title).filter(Boolean)));

  // Separate featured and regular
  const featuredProjects = projects.filter((p) => p.Big_project);
  const regularProjects = projects.filter((p) => !p.Big_project);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFeatured = featuredProjects.filter((p) => {
    const matchesTitle =
      !searchTerm ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      !selectedCategory || p.Portfolio_Category === selectedCategory;
    return matchesTitle && matchesCategory;
  });

  const filteredRegular = regularProjects.filter((p) => {
    const matchesTitle =
      !searchTerm ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      !selectedCategory || p.Portfolio_Category === selectedCategory;
    return matchesTitle && matchesCategory;
  });

  const filteredTotal = filteredFeatured.length + filteredRegular.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-4">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          ← Kembali ke Home
        </Link>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent">
              Portofolio Kami
            </span>
          </h1>
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Kumpulan proyek kreatif yang telah kami kerjakan dengan penuh dedikasi
            dan passion untuk kesuksesan klien kami.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <PortfolioSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            suggestions={allTitles}
          />
        </div>

        {/* Category Filter */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="inline-block bg-white rounded-2xl shadow-lg p-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Semua Proyek
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat ? null : cat
                    )
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-12">
            <p className="text-gray-600 text-lg">
              {filteredTotal > 0
                ? `Menampilkan ${filteredTotal} proyek${selectedCategory ? ` di kategori "${selectedCategory}"` : ""}`
                : `Tidak ada proyek untuk pencarian "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>

      {/* Featured Projects Section */}
      {filteredFeatured.length > 0 && (
        <div className="max-w-7xl mx-auto mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-10 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Proyek Unggulan
            </h2>
            <span className="ml-auto inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-bold rounded-full border border-blue-200 shadow-sm">
              ⭐ {filteredFeatured.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFeatured.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {project.imageUrl ? (
                    <>
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-gray-400 text-6xl">📸</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Unggulan
                  </div>

                  {/* Category Badge */}
                  {project.Portfolio_Category && (
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-white/50">
                      {project.Portfolio_Category}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <h3 className="text-white font-bold text-3xl sm:text-4xl lg:text-5xl drop-shadow-lg leading-tight mb-4">
                      {project.title}
                    </h3>
                    <div className="w-16 h-1.5 bg-gradient-to-r from-white to-white/50 rounded-full" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Regular Projects Section */}
      {filteredRegular.length > 0 && (
        <div className="max-w-7xl mx-auto">
          {filteredFeatured.length > 0 && (
            <div className="flex items-center gap-4 mb-10">
              <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Proyek Lainnya
              </h2>
              <span className="ml-auto inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-bold rounded-full border border-blue-200 shadow-sm">
                📁 {filteredRegular.length}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredRegular.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className="group relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {project.imageUrl ? (
                    <>
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                      <span className="text-gray-400 text-5xl">📸</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {project.Portfolio_Category && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-lg text-xs font-bold shadow-md border border-white/50">
                      {project.Portfolio_Category}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-lg leading-tight">
                      {project.title}
                    </h3>
                    <div className="w-8 h-1 bg-white/70 rounded-full mt-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTotal === 0 && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-lg">
            <svg
              className="w-14 h-14 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            {searchTerm ? "Proyek Tidak Ditemukan" : "Belum Ada Proyek"}
          </h3>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {searchTerm
              ? `Tidak ada proyek yang sesuai dengan pencarian Anda.`
              : "Portfolio sedang dalam tahap pengembangan. Silakan kunjungi kembali nanti."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Tampilkan Semua Proyek
            </button>
          )}
        </div>
      )}
    </div>
  );
}