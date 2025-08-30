// src/hooks/useOfflineData.ts
import { useEffect, useState, useCallback } from 'react';
import { Banner, Category, Product } from '@/lib/types';
import { getBanners, getCategories, getPortfolioProjects, getProductsByCategory } from '@/lib/api';

interface OfflineData {
  banners: Banner[];
  categories: Category[];
  portfolios: Array<{ id: number; title: string; imageUrl: string }>;
  products: Record<string, Product[]>; // Keyed by category name
  lastSynced: number; // Timestamp
}

const STORAGE_KEY = 'offline_catalog_data';

export function useOfflineData() {
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
          setOfflineData(JSON.parse(storedData));
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
  const syncData = useCallback(async () => {
    if (!isOnline) {
      setError('You are offline. Cannot sync data.');
      return false;
    }

    setIsSyncing(true);
    setError(null);

    try {
      console.log('🔄 Syncing data from API...');
      
      // Fetch all basic data
      const [bannersData, categoriesData, portfoliosData] = await Promise.all([
        getBanners(),
        getCategories(),
        getPortfolioProjects()
      ]);

      // Fetch products for each category
      const productsData: Record<string, Product[]> = {};
      for (const category of categoriesData) {
        productsData[category.name] = await getProductsByCategory(category.name);
      }

      // Create new offline data object
      const newOfflineData: OfflineData = {
        banners: bannersData,
        categories: categoriesData,
        portfolios: portfoliosData,
        products: productsData,
        lastSynced: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOfflineData));
      setOfflineData(newOfflineData);
      
      // Send data to service worker for caching
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_API_DATA',
          data: newOfflineData
        });
      }
      
      console.log('✅ Data synced successfully!');
      return true;
    } catch (err) {
      console.error('❌ Error syncing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

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
}