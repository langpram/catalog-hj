// src/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 px-0 hover:bg-transparent"
    >
      <ChevronLeft className="w-4 h-4" />
      Kembali ke Daftar Produk
    </Button>
  );
}