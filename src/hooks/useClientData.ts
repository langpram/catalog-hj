// src/hooks/useClientData.ts
import { useEffect, useState } from "react";
import { getBanners, getCategories, getPortfolioProjects } from "@/lib/api";
import { Banner, Category } from "@/lib/types";

export function useClientData() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolios, setPortfolios] = useState<
    Array<{ id: number; title: string; imageUrl: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("🔥 Starting to fetch data...");

        const [bannersData, categoriesData, portfoliosData] = await Promise.all(
          [getBanners(), getCategories(), getPortfolioProjects()]
        );

        console.log("📦 Banners:", bannersData);
        console.log("📦 Categories:", categoriesData);
        console.log("📦 Portfolios:", portfoliosData);

        setBanners(bannersData);
        setCategories(categoriesData);
        setPortfolios(portfoliosData);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { banners, categories, portfolios, loading, error };
}
