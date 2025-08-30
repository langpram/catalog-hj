// src/components/ProductPageCache.tsx
"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ProductPageCache() {
  const pathname = usePathname();

  useEffect(() => {
    // Cache product pages when user visits them
    if (pathname && pathname.includes('/product/')) {
      cacheProductPage(pathname);
    }
  }, [pathname]);

  const cacheProductPage = (url: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_PRODUCT_PAGE',
        url: url
      });
      console.log('Product page cache requested:', url);
    }
  };

  return null; // This component doesn't render anything
}
