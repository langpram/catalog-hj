// src/app/portfolio/page.tsx - UPDATED DENGAN SEARCH & KATEGORI FILTER

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari judul proyek..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          onFocus={() => {
            if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
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

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((category, index) => (
            <button
              key={`${category}-${index}`}
              onClick={() => {
                setSearchTerm(category);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-gray-900 dark:text-white">{category}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto mb-4">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Kembali ke Home
        </Link>
      </div>
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
          Portofolio
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Kumpulan proyek kreatif yang telah kami kerjakan dengan penuh dedikasi
          dan passion.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <PortfolioSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            suggestions={allTitles}
          />
        </div>

        {/* Category Filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              Semua
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat ? null : cat
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredTotal > 0
                ? `Menampilkan ${filteredTotal} proyek${selectedCategory ? ` di kategori "${selectedCategory}"` : ""} untuk judul yang mengandung "${searchTerm}"`
                : `Tidak ada proyek${selectedCategory ? ` di kategori "${selectedCategory}"` : ""} dengan judul yang mengandung "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>

      {/* Featured Projects Section */}
      {filteredFeatured.length > 0 && (
        <div className="max-w-7xl mx-auto mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Proyek Unggulan
              </h2>
              <span className="ml-auto text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                📌 {filteredFeatured.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {filteredFeatured.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className="group relative bg-white rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 border border-blue-100"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {project.imageUrl ? (
                    <>
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-6xl">📸</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Unggulan
                  </div>

                  {/* Category Badge */}
                  {project.Portfolio_Category && (
                    <div className="absolute top-4 left-4 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      {project.Portfolio_Category}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h2 className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg leading-tight">
                      {project.title}
                    </h2>
                    <div className="w-12 h-1 bg-white/80 mt-3" />
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
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Proyek Lainnya
              </h2>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredRegular.map((project) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug || project.id}`}
                className="group relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {project.imageUrl ? (
                    <>
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-4xl">📸</span>
                    </div>
                  )}

                  {/* Category Badge */}
                  {project.Portfolio_Category && (
                    <div className="absolute top-2 left-2 bg-white/80 text-gray-900 px-2 py-1 rounded text-xs font-semibold shadow-sm">
                      {project.Portfolio_Category}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h2 className="text-white font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-lg leading-tight">
                      {project.title}
                    </h2>
                    <div className="w-12 h-1 bg-white/60 mt-2" />
                  </div>

                  <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTotal === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {searchTerm ? "Proyek Tidak Ditemukan" : "Belum Ada Proyek"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? `Tidak ada proyek dalam kategori "${searchTerm}".`
              : "Portfolio sedang dalam tahap pengembangan."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tampilkan Semua Proyek
            </button>
          )}
        </div>
      )}
    </div>
  );
}
