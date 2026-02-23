// src/hooks/useOfflineData.ts - UPDATED WITH PORTFOLIO
import { useEffect, useState, useCallback } from 'react';
import { Banner, Category, Product, Portfolio } from '@/lib/types';
import { getBanners, getCategories, getPortfolioProjects, getProductsByCategory } from '@/lib/api';

interface OfflineData {
  banners: Banner[];
  categories: Category[];
  portfolios: Portfolio[]; // 🔥 ADD PORTFOLIO
  products: Record<string, Product[]>;
  lastSynced: number;
}

const STORAGE_KEY = 'offline_catalog_data';

// 🔥 Sort portfolios - Big_project TRUE duluan
const sortPortfoliosByFeatured = (portfolios: Portfolio[]): Portfolio[] => {
  const portfoliosCopy = [...portfolios];
  
  portfoliosCopy.sort((a, b) => {
    if (a.Big_project && !b.Big_project) return -1;
    if (!a.Big_project && b.Big_project) return 1;
    return a.id - b.id;
  });

  return portfoliosCopy;
};

// Sort products - best sellers duluan
const sortProductsByBestSeller = (products: Product[]): Product[] => {
  const productsCopy = [...products];

  productsCopy.sort((a, b) => {
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return a.id - b.id;
  });

  return productsCopy;
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
          
          // 🔥 SORT portfolios saat load
          if (parsed.portfolios) {
            parsed.portfolios = sortPortfoliosByFeatured(parsed.portfolios);
          }
          
          // 🔥 SORT products saat load
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

    // Set up online/offline event listeners
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

  // Function to sync data from API
  const syncData = useCallback(async (manualOnProgress?: (progress: number, message: string) => void) => {
    if (!isOnline) {
      setError('You are offline. Cannot sync data.');
      return false;
    }
    
    // Use manual callback or hook-level callback
    const onProgress = manualOnProgress || options?.onSyncProgress;

    setIsSyncing(true);
    setError(null);
    if (onProgress) onProgress(0, 'Starting sync...');

    try {
      console.log('🔄 Syncing data from API...');
      if (onProgress) onProgress(5, 'Fetching data from API...');
      
      // Fetch all basic data
      const [bannersData, categoriesData, portfoliosData] = await Promise.all([
        getBanners(),
        getCategories(),
        getPortfolioProjects() // 🔥 Fetch portfolio
      ]);

      if (onProgress) onProgress(15, 'Processing data...');

      // 🔥 Sort portfolios setelah fetch
      const sortedPortfolios = sortPortfoliosByFeatured(portfoliosData);

      // Fetch products for each category
      const productsData: Record<string, Product[]> = {};
      let totalCategories = categoriesData.length;
      let processedCategories = 0;

      for (const category of categoriesData) {
        const products = await getProductsByCategory(category.name);
        // 🔥 Products already sorted by API, but ensure it here too
        productsData[category.name] = sortProductsByBestSeller(products);
        
        processedCategories++;
        if (onProgress) {
          const progress = 15 + Math.round((processedCategories / totalCategories) * 15); // 15% to 30%
          onProgress(progress, `Fetching products for ${category.name}...`);
        }
      }

      // Collect all image URLs for caching
      if (onProgress) onProgress(30, 'Preparing assets for download...');
      const imageUrls = new Set<string>();

      // Banners
      bannersData.forEach(b => {
        if (b.imageUrl) imageUrls.add(b.imageUrl);
      });

      // Categories
      categoriesData.forEach(c => {
        if (c.imageUrl) imageUrls.add(c.imageUrl);
      });

      // Portfolios
      sortedPortfolios.forEach(p => {
        if (p.imageUrl) imageUrls.add(p.imageUrl);
        if (p.pict) p.pict.forEach(url => imageUrls.add(url));
      });

      // Products
      Object.values(productsData).flat().forEach(p => {
        if (p.images) {
          p.images.forEach(img => {
            if (img.url) imageUrls.add(img.url);
          });
        }
      });

      // Download images
      const totalImages = imageUrls.size;
      let downloadedImages = 0;
      const urlsArray = Array.from(imageUrls);
      
      console.log(`📥 Downloading ${totalImages} assets for offline use...`);
      
      // Download in batches to avoid network congestion
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
          const progress = 30 + Math.round((Math.min(downloadedImages, totalImages) / totalImages) * 65); // 30% to 95%
          onProgress(progress, `Downloading assets (${Math.min(downloadedImages, totalImages)}/${totalImages})...`);
        }
      }

      if (onProgress) onProgress(90, 'Preparing to save data...');

      // Create new offline data object
      const newOfflineData: OfflineData = {
        banners: bannersData,
        categories: categoriesData,
        portfolios: sortedPortfolios, // 🔥 Use sorted portfolios
        products: productsData,
        lastSynced: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOfflineData));
      setOfflineData(newOfflineData);

      // Pre-cache important pages (home, listing, and portfolio detail pages)
      if (typeof window !== 'undefined') {
        const pageUrls = new Set<string>();
        pageUrls.add('/');
        pageUrls.add('/products');
        pageUrls.add('/portfolio');

        sortedPortfolios.forEach((p) => {
          const slugOrId = p.slug || p.id.toString();
          pageUrls.add(`/portfolio/${slugOrId}`);
        });

        const origin = window.location.origin;
        const allPageUrls = Array.from(pageUrls);

        for (let i = 0; i < allPageUrls.length; i++) {
          const path = allPageUrls[i];
          const url = `${origin}${path}`;
          try {
            await fetch(url);
          } catch (e) {
            console.warn(`Failed to pre-cache page: ${url}`, e);
          }

          if (onProgress) {
            const progress =
              90 + Math.round(((i + 1) / allPageUrls.length) * 5); // 90% to 95%
            onProgress(progress, `Caching pages for offline use (${i + 1}/${allPageUrls.length})...`);
          }
        }
      }

      if (onProgress) onProgress(100, 'Saving data...');
      
      // Send data to service worker for caching
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_API_DATA',
          data: newOfflineData
        });
      }
      
      // Log summary
      const featuredPortfolios = sortedPortfolios.filter(p => p.Big_project).length;
      const bestSellerProducts = Object.values(productsData).flat().filter(p => p.isBestSeller).length;
      
      console.log('✅ Data synced successfully!');
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

  // Function to apply service worker update
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
    applyUpdate
  };
};
