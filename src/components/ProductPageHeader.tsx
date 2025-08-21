// src/components/ProductPageHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Definisikan tipe untuk props
interface ProductPageHeaderProps {
  categoryName: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function ProductPageHeader({
  categoryName,
  searchValue,
  onSearchChange,
}: ProductPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 shadow-sm p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        {/* Kiri: Logo */}
        <Link href="/" aria-label="Kembali ke Halaman Utama">
          <Home className="h-8 w-8 text-blue-600" />
        </Link>

        {/* Tengah: Input Pencarian */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder={`Cari di ${categoryName}...`}
            className="w-full pl-10"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Kanan: Tombol Kembali */}
        <Button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
    </header>
  );
}
