// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useState, useEffect } from "react";
import { PWAStatus } from "@/components/PWAStatus";
import { ServiceWorkerDebug } from "@/components/ServiceWorkerDebug";

export default function LandingPage() {
  const { syncData, isSyncing, lastSynced, isOnline, updateAvailable, applyUpdate } = useOfflineData();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  // Format last synced date
  const formattedLastSynced = lastSynced 
    ? new Date(lastSynced).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Belum pernah';

  // Handle sync button click
  const handleSync = async () => {
    if (!isOnline) {
      setSyncMessage("Tidak dapat sinkronisasi data. Anda sedang offline.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }

    const success = await syncData();
    if (success) {
      setSyncMessage("Data berhasil disinkronkan!");
    } else {
      setSyncMessage("Gagal sinkronisasi data. Silakan coba lagi.");
    }
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  // Handle update button click
  const handleUpdate = () => {
    applyUpdate();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
      {/* PWA Status */}
      <PWAStatus />

      {/* Service Worker Debug (only in development)
      {process.env.NODE_ENV === 'development' && <ServiceWorkerDebug />} */}

      {/* Status connection indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Update notification */}
      {updateAvailable && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>🔄 Update tersedia!</span>
            <Button
              size="sm"
              onClick={handleUpdate}
              className="bg-white text-blue-500 hover:bg-gray-100"
            >
              Update
            </Button>
          </div>
        </div>
      )}

      {/* App title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          HJKARPET - Katalog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Supplier karpet berkualitas tinggi
        </p>
      </div>

      {/* Main buttons */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Link href="/products">
          <Button
            size="lg"
            className="w-64 h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            📦 Products
          </Button>
        </Link>
        <Link href="/portofolio">
          <Button
            size="lg"
            className="w-64 h-20 text-2xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg"
          >
            🖼️ Portfolio
          </Button>
        </Link>
        <Button
          size="lg"
          className="w-64 h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <span className="animate-spin mr-2">⟳</span> Syncing...
            </>
          ) : (
            '🔄 Sync Data'
          )}
        </Button>
      </div>

      {/* Last synced info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        <p>Terakhir disinkronkan: {formattedLastSynced}</p>
        <p className="mt-2">
          {isOnline 
            ? "✅ Terhubung ke internet - Data dapat diperbarui" 
            : "📱 Mode offline - Menggunakan data tersimpan"
          }
        </p>
      </div>

      {/* PWA install prompt */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          💡 Tips: Klik menu 3 titik di browser untuk "Install app"
        </p>
      </div>

      {/* Sync message */}
      {showMessage && syncMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full shadow-lg z-50">
          {syncMessage}
        </div>
      )}
    </main>
  );
}