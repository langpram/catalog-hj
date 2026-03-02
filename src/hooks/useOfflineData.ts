// src/hooks/useOfflineData.ts
import { useEffect, useState, useCallback } from 'react';
import { Banner, Category, Product, Portfolio } from '@/lib/types';
import { getBanners, getCategories, getPortfolioProjects, getProductsByCategory } from '@/lib/api';

interface OfflineData {
  banners: Banner[];
  categories: Category[];
  portfolios: Portfolio[];
  products: Record<string, Product[]>;
  lastSynced: number;
}

const STORAGE_KEY = 'offline_catalog_data';

const sortPortfoliosByFeatured = (portfolios: Portfolio[]): Portfolio[] => {
  return [...portfolios].sort((a, b) => {
    if (a.Big_project && !b.Big_project) return -1;
    if (!a.Big_project && b.Big_project) return 1;
    return a.id - b.id;
  });
};

const sortProductsByBestSeller = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return a.id - b.id;
  });
};

export const useOfflineData = (options?: { onSyncProgress?: (progress: number, message: string) => void }) => {
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);

          if (parsed.portfolios) {
            parsed.portfolios = sortPortfoliosByFeatured(parsed.portfolios);
          }

          if (parsed.products) {
            Object.keys(parsed.products).forEach(categoryName => {
              parsed.products[categoryName] = sortProductsByBestSeller(parsed.products[categoryName]);
            });
          }

          setOfflineData(parsed);
        }
      } catch (err) {
        console.error('Error loading offline data:', err);
        setError('Failed to load offline data');
      } finally {
        setIsLoading(false);
      }
    };

    loadOfflineData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const syncData = useCallback(async (manualOnProgress?: (progress: number, message: string) => void) => {
    if (!isOnline) {
      setError('You are offline. Cannot sync data.');
      return false;
    }

    const onProgress = manualOnProgress || options?.onSyncProgress;

    setIsSyncing(true);
    setError(null);
    if (onProgress) onProgress(0, 'Starting sync...');

    try {
      console.log('🔄 Syncing data from API...');
      if (onProgress) onProgress(5, 'Fetching data from API...');

      const [bannersData, categoriesData, portfoliosData] = await Promise.all([
        getBanners(),
        getCategories(),
        getPortfolioProjects(),
      ]);

      if (onProgress) onProgress(15, 'Processing data...');

      const sortedPortfolios = sortPortfoliosByFeatured(portfoliosData);

      // ============================================================
      // 🔥 PISAH: root categories vs child categories
      // ============================================================
      const rootCategories = categoriesData.filter((c) => !c.parent);
      const childCategories = categoriesData.filter((c) => !!c.parent);

      console.log(`📂 Root categories: ${rootCategories.map(c => c.name).join(', ')}`);
      console.log(`📁 Child categories: ${childCategories.map(c => c.name).join(', ')}`);

      const productsData: Record<string, Product[]> = {};

      // Hitung total untuk progress — root + child
      const allCategoriesToFetch = [...rootCategories, ...childCategories];
      const totalCategories = allCategoriesToFetch.length;
      let processedCategories = 0;

      // Fetch produk untuk ROOT categories
      for (const category of rootCategories) {
        const products = await getProductsByCategory(category.name);
        productsData[category.name] = sortProductsByBestSeller(products);

        processedCategories++;
        if (onProgress) {
          const progress = 15 + Math.round((processedCategories / totalCategories) * 15);
          onProgress(progress, `Fetching products for ${category.name}...`);
        }
      }

      // Fetch produk untuk CHILD categories
      for (const category of childCategories) {
        const products = await getProductsByCategory(category.name);
        productsData[category.name] = sortProductsByBestSeller(products);

        processedCategories++;
        if (onProgress) {
          const progress = 15 + Math.round((processedCategories / totalCategories) * 15);
          onProgress(progress, `Fetching products for ${category.name}...`);
        }
      }

      // ============================================================
      // Collect image URLs untuk caching
      // ============================================================
      if (onProgress) onProgress(30, 'Preparing assets for download...');
      const imageUrls = new Set<string>();

      bannersData.forEach(b => {
        if (b.imageUrl) imageUrls.add(b.imageUrl);
      });

      // 🔥 Collect gambar semua kategori (root + child)
      categoriesData.forEach(c => {
        if (c.imageUrl) imageUrls.add(c.imageUrl);
        // Juga collect gambar children jika ada
        c.children?.forEach(child => {
          if (child.imageUrl) imageUrls.add(child.imageUrl);
        });
      });

      sortedPortfolios.forEach(p => {
        if (p.imageUrl) imageUrls.add(p.imageUrl);
        if (p.pict) p.pict.forEach(url => imageUrls.add(url));
      });

      Object.values(productsData).flat().forEach(p => {
        if (p.images) {
          p.images.forEach(img => {
            if (img.url) imageUrls.add(img.url);
          });
        }
      });

      // Download images in batches
      const totalImages = imageUrls.size;
      let downloadedImages = 0;
      const urlsArray = Array.from(imageUrls);

      console.log(`📥 Downloading ${totalImages} assets for offline use...`);

      const BATCH_SIZE = 5;
      for (let i = 0; i < urlsArray.length; i += BATCH_SIZE) {
        const batch = urlsArray.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (url) => {
          try {
            await fetch(url, { mode: 'no-cors' });
          } catch (e) {
            console.warn(`Failed to pre-fetch image: ${url}`, e);
          }
        }));

        downloadedImages += batch.length;
        if (onProgress) {
          const progress = 30 + Math.round((Math.min(downloadedImages, totalImages) / totalImages) * 60);
          onProgress(progress, `Downloading assets (${Math.min(downloadedImages, totalImages)}/${totalImages})...`);
        }
      }

      if (onProgress) onProgress(90, 'Preparing to save data...');

      const newOfflineData: OfflineData = {
        banners: bannersData,
        categories: categoriesData, // 🔥 Simpan SEMUA kategori (root + child) agar [slug]/page bisa lookup children
        portfolios: sortedPortfolios,
        products: productsData,
        lastSynced: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOfflineData));
      setOfflineData(newOfflineData);

      // Pre-cache pages
      if (typeof window !== 'undefined') {
        const pageUrls = new Set<string>();
        pageUrls.add('/');
        pageUrls.add('/products');
        pageUrls.add('/portfolio');

        // 🔥 Cache halaman untuk root categories
        rootCategories.forEach(c => {
          const slug = c.name.toLowerCase().replace(/\s+/g, '-');
          pageUrls.add(`/products/${slug}`);
        });

        // 🔥 Cache halaman untuk child categories
        childCategories.forEach(c => {
          const slug = c.name.toLowerCase().replace(/\s+/g, '-');
          pageUrls.add(`/products/${slug}`);
        });

        sortedPortfolios.forEach((p) => {
          const slugOrId = p.slug || p.id.toString();
          pageUrls.add(`/portfolio/${slugOrId}`);
        });

        const origin = window.location.origin;
        const allPageUrls = Array.from(pageUrls);

        for (let i = 0; i < allPageUrls.length; i++) {
          const path = allPageUrls[i];
          try {
            await fetch(`${origin}${path}`);
          } catch (e) {
            console.warn(`Failed to pre-cache page: ${path}`, e);
          }

          if (onProgress) {
            const progress = 90 + Math.round(((i + 1) / allPageUrls.length) * 9);
            onProgress(progress, `Caching pages (${i + 1}/${allPageUrls.length})...`);
          }
        }
      }

      if (onProgress) onProgress(100, 'Saving data...');

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_API_DATA',
          data: newOfflineData,
        });
      }

      // Log summary
      const featuredPortfolios = sortedPortfolios.filter(p => p.Big_project).length;
      const bestSellerProducts = Object.values(productsData).flat().filter(p => p.isBestSeller).length;

      console.log('✅ Data synced successfully!');
      console.log(`📂 Root categories: ${rootCategories.length}`);
      console.log(`📁 Child categories: ${childCategories.length}`);
      console.log(`📌 Featured portfolios: ${featuredPortfolios}`);
      console.log(`⭐ Best seller products: ${bestSellerProducts}`);

      if (onProgress) onProgress(100, 'Sync complete!');
      return true;
    } catch (err) {
      console.error('❌ Error syncing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, options?.onSyncProgress]);

  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, []);

  // Initial sync if no data exists
  useEffect(() => {
    if (!offlineData && isOnline && !isLoading) {
      syncData();
    }
  }, [offlineData, isOnline, isLoading, syncData]);

  return {
    data: offlineData,
    isLoading,
    isSyncing,
    error,
    isOnline,
    syncData,
    lastSynced: offlineData?.lastSynced,
    updateAvailable,
    applyUpdate,
  };
};