// src/app/page.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row gap-6">
        <Link href="/products">
          <Button
            size="lg"
            className="w-64 h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Products
          </Button>
        </Link>
        {/* Tombol Portfolio bisa ditambahkan linknya nanti */}
        <Link href="/portofolio">
        <Button
          size="lg"
        className="w-64 h-20 text-2xl font-bold bg-red-600 hover:bg-red-700 text-white"
          // disabled // non-aktifkan sementara
        >
          Portfolio
        </Button>
        </Link>
      </div>
    </main>
  );
}