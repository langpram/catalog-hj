// src/hooks/useClientData.ts
import { useEffect, useState } from "react";
import { getBanners, getCategories, getPortfolioProjects, getProductsByCategory } from "@/lib/api";
import { Banner, Category, Product } from "@/lib/types";

interface OfflineData {
  banners: Banner[];
  categories: Category[];
  portfolios: Array<{ id: number; title: string; imageUrl: string }>;
  products: Record<string, Product[]>;
  lastSynced: number;
}

const STORAGE_KEY = 'offline_catalog_data';

// Fungsi validasi untuk memastikan data offline memiliki struktur yang benar
function isValidOfflineData(data: any): data is OfflineData {
  return (
    data &&
    Array.isArray(data.banners) &&
    Array.isArray(data.categories) &&
    Array.isArray(data.portfolios) &&
    typeof data.products === 'object' &&
    typeof data.lastSynced === 'number'
  );
}

export function useClientData() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolios, setPortfolios] = useState<
    Array<{ id: number; title: string; imageUrl: string }>
  >([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔥 Starting to fetch data...");

        // Check if we have offline data first
        const storedData = localStorage.getItem(STORAGE_KEY);
        let offlineData: OfflineData | null = null;
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (isValidOfflineData(parsedData)) {
              offlineData = parsedData;
              console.log("📦 Using valid offline data from localStorage");
            } else {
              console.warn("⚠️ Invalid offline data structure, ignoring...");
            }
          } catch (err) {
            console.error("Error parsing offline data:", err);
          }
        }

        // If we have offline data, use it immediately
        if (offlineData) {
          setBanners(offlineData.banners);
          setCategories(offlineData.categories);
          setPortfolios(offlineData.portfolios);
          setProducts(offlineData.products);
          setLoading(false);
        }

        // If online, try to fetch fresh data
        if (isOnline) {
          try {
            console.log("🌐 Fetching fresh data from API...");
            const [bannersData, categoriesData, portfoliosData] = await Promise.all(
              [getBanners(), getCategories(), getPortfolioProjects()]
            );

            console.log("📦 Fresh Banners:", bannersData);
            console.log("📦 Fresh Categories:", categoriesData);
            console.log("📦 Fresh Portfolios:", portfoliosData);

            // Update state with fresh data
            setBanners(bannersData);
            setCategories(categoriesData);
            setPortfolios(portfoliosData);

            // Fetch products for each category
            const productsData: Record<string, Product[]> = {};
            for (const category of categoriesData) {
              productsData[category.name] = await getProductsByCategory(category.name);
            }
            setProducts(productsData);

            // Update offline data
            const newOfflineData: OfflineData = {
              banners: bannersData,
              categories: categoriesData,
              portfolios: portfoliosData,
              products: productsData,
              lastSynced: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newOfflineData));

            // Send to service worker
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_API_DATA',
                data: newOfflineData
              });
            }

          } catch (err) {
            console.error("❌ Error fetching fresh data:", err);
            if (!offlineData) {
              setError(err instanceof Error ? err.message : "Unknown error");
            }
          }
        } else {
          console.log("📱 Offline mode - using cached data");
        }

      } catch (err) {
        console.error("❌ Error in fetchData:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up online/offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // Function to get products by category
  const getProductsByCategoryName = (categoryName: string): Product[] => {
    return products[categoryName] || [];
  };

  return { 
    banners, 
    categories, 
    portfolios, 
    products,
    getProductsByCategoryName,
    loading, 
    error,
    isOnline
  };
}
