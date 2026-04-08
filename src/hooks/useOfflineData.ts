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

// Helper untuk prefetch satu image dengan handling ngrok
const prefetchImage = async (url: string): Promise<boolean> => {
  try {
    if (!url || !url.startsWith('http')) return false;

    const finalUrl = url + (url.includes('?') ? '&' : '?') + 'ngrok-skip-browser-warning=true';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 detik timeout

    const response = await fetch(finalUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.type === 'opaque' || response.ok;
  } catch (error) {
    console.warn(`Failed to pre-fetch image: ${url}`, error);
    return false;
  }
};

export const useOfflineData = (options?: { onSyncProgress?: (progress: number, message: string) => void }) => {
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Load data from localStorage
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
            Object.keys(parsed.products).forEach(key => {
              parsed.products[key] = sortProductsByBestSeller(parsed.products[key]);
            });
          }

          setOfflineData(parsed);
        }
      } catch (err) {
        console.error('Error loading offline data:', err);
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

  // Service Worker update listener
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
      if (onProgress) onProgress(5, 'Fetching main data...');

      const [bannersData, categoriesData, portfoliosData] = await Promise.all([
        getBanners(),
        getCategories(),
        getPortfolioProjects(),
      ]);

      if (onProgress) onProgress(15, 'Processing categories...');

      const sortedPortfolios = sortPortfoliosByFeatured(portfoliosData);

      // Pisah root & child categories
      const rootCategories = categoriesData.filter((c) => !c.parent);
      const childCategories = categoriesData.filter((c) => !!c.parent);

      console.log(`📂 Root categories: ${rootCategories.length}`);
      console.log(`📁 Child categories: ${childCategories.length}`);

      const productsData: Record<string, Product[]> = {};
      const allCategoriesToFetch = [...rootCategories, ...childCategories];

      // Fetch products per category
      for (let i = 0; i < allCategoriesToFetch.length; i++) {
        const category = allCategoriesToFetch[i];
        const products = await getProductsByCategory(category.name);
        productsData[category.name] = sortProductsByBestSeller(products);

        if (onProgress) {
          const progress = 15 + Math.round(((i + 1) / allCategoriesToFetch.length) * 15);
          onProgress(progress, `Fetching products for ${category.name}...`);
        }
      }

      // ============================================================
      // Collect ALL image URLs
      // ============================================================
      if (onProgress) onProgress(35, 'Collecting images...');

      const imageUrls = new Set<string>();

      bannersData.forEach(b => b.imageUrl && imageUrls.add(b.imageUrl));
      categoriesData.forEach(c => {
        if (c.imageUrl) imageUrls.add(c.imageUrl);
        c.children?.forEach(child => child.imageUrl && imageUrls.add(child.imageUrl));
      });
      sortedPortfolios.forEach(p => {
        if (p.imageUrl) imageUrls.add(p.imageUrl);
        p.pict?.forEach(url => url && imageUrls.add(url));
      });
      Object.values(productsData).flat().forEach(p => {
        p.images?.forEach(img => img.url && imageUrls.add(img.url));
      });

      const urlsArray = Array.from(imageUrls);
      const totalImages = urlsArray.length;
      console.log(`📥 Found ${totalImages} images to prefetch`);

      // ============================================================
      // Prefetch Images dengan batch kecil + delay (Paling Krusial)
      // ============================================================
      if (onProgress) onProgress(40, 'Downloading images...');

      const BATCH_SIZE = 3;           // Kecil biar ngrok tidak mati
      const DELAY_MS = 700;           // Delay antar batch
      let successCount = 0;

      for (let i = 0; i < urlsArray.length; i += BATCH_SIZE) {
        const batch = urlsArray.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(batch.map(url => prefetchImage(url)));
        successCount += results.filter(Boolean).length;

        if (onProgress) {
          const progress = 40 + Math.round(((i + batch.length) / totalImages) * 50);
          onProgress(progress, `Downloading images (${successCount}/${totalImages})...`);
        }

        // Delay antar batch supaya ngrok tenang
        if (i + BATCH_SIZE < urlsArray.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      if (onProgress) onProgress(90, 'Saving data to localStorage...');

      const newOfflineData: OfflineData = {
        banners: bannersData,
        categories: categoriesData,
        portfolios: sortedPortfolios,
        products: productsData,
        lastSynced: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOfflineData));
      setOfflineData(newOfflineData);

      // Optional: Pre-cache important pages
      if (onProgress) onProgress(95, 'Caching pages...');
      // ... (kode caching page bisa kamu tambah lagi kalau perlu)

      console.log('✅ Data synced successfully!');
      console.log(`📂 Root: ${rootCategories.length} | Child: ${childCategories.length}`);
      console.log(`🖼️  Images prefetched: ${successCount}/${totalImages}`);

      if (onProgress) onProgress(100, 'Sync complete!');
      return true;

    } catch (err: any) {
      console.error('❌ Error syncing data:', err);
      setError(err.message || 'Failed to sync data');
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

  // Auto sync pertama kali kalau belum ada data
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