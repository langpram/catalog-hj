// src/app/offline/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Anda Sedang Offline
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Halaman yang Anda cari tidak tersedia offline. 
            Silakan kunjungi halaman yang sudah di-cache atau hubungkan kembali ke internet.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              🏠 Kembali ke Beranda
            </Button>
          </Link>
          
          <Link href="/products">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              📦 Lihat Produk
            </Button>
          </Link>

          <Link href="/portofolio">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              🖼️ Lihat Portfolio
            </Button>
          </Link>

          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            🔄 Coba Lagi
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>💡 Tips: Pastikan Anda sudah sync data saat online untuk akses offline yang lebih baik.</p>
        </div>
      </div>
    </main>
  );
}
