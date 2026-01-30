// src/app/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useState, useEffect, useCallback } from "react";
import { PWAStatus } from "@/components/PWAStatus";
import { ServiceWorkerDebug } from "@/components/ServiceWorkerDebug";
import { SyncModal } from "@/components/SyncModal";
import { ProductsIcon, PortfolioIcon, SyncIcon, SyncingIcon, CheckIcon, PhoneIcon } from "@/components/SVGIcons";

export default function LandingPage() {
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  
  // Sync Modal State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState("");

  // Callback for sync progress (passed to hook)
  const handleSyncProgress = useCallback((progress: number, message: string) => {
    setSyncProgress(progress);
    setSyncStatus(message);
    setIsSyncModalOpen(true);
  }, []);

  const { syncData, isSyncing, lastSynced, isOnline, updateAvailable, applyUpdate } = useOfflineData({ 
    onSyncProgress: handleSyncProgress 
  });

  // Handle modal closing and messages when sync finishes
  useEffect(() => {
    if (!isSyncing && isSyncModalOpen) {
      const timer = setTimeout(() => {
        setIsSyncModalOpen(false);
        
        // Show success/error message
        if (syncProgress === 100) {
          setSyncMessage("Data berhasil disinkronkan & didownload!");
        } else {
          setSyncMessage("Gagal sinkronisasi data.");
        }
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isSyncing, isSyncModalOpen, syncProgress]);

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

    setIsSyncModalOpen(true);
    setSyncProgress(0);
    setSyncStatus("Menghubungkan ke server...");

    await syncData();
    // Logic handled by useEffect
  };

  // Handle update button click
  const handleUpdate = () => {
    applyUpdate();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#1A3D63] to-[#4A7FA7] -z-10"></div>
      
      {/* Decorative blob shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B3CFE5] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A7FA7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1A3D63] rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* PWA Status */}
      <PWAStatus />

      {/* Service Worker Debug (only in development)
      {process.env.NODE_ENV === 'development' && <ServiceWorkerDebug />} */}

      {/* Status connection indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
        <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-[#B3CFE5]' : 'bg-[#1A3D63]'}`}></div>
        <span className="text-sm font-medium text-white/80">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Update notification */}
      {updateAvailable && (
        <div className="absolute top-6 left-6 bg-[#B3CFE5] backdrop-blur-sm text-[#0A1931] px-6 py-3 rounded-2xl shadow-lg border border-white/30">
          <div className="flex items-center gap-3">
            <span className="font-semibold">🔄 Update tersedia!</span>
            <Button
              size="sm"
              onClick={handleUpdate}
              className="bg-[#0A1931] text-[#B3CFE5] hover:bg-[#1A3D63] font-medium transition-all duration-300"
            >
              Update
            </Button>
          </div>
        </div>
      )}

      {/* Content container */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        {/* App title */}
        <div className="mb-12 space-y-3 drop-shadow-lg">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
            HJKARPET
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-[#B3CFE5] to-[#4A7FA7] mx-auto rounded-full"></div>
          <p className="text-lg text-[#B3CFE5] font-medium">
            Dari Indonesia untuk Indonesia. Karpet Custom Premium dengan Sentuhan Lokal yang Mendunia.
          </p>
        </div>

        {/* Main buttons */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 justify-center">
          <Link href="/products" className="w-full lg:w-72">
            <Button
              size="lg"
              className="w-full lg:w-72 h-20 lg:h-24 text-xl lg:text-2xl font-bold bg-gradient-to-br from-[#B3CFE5] to-[#4A7FA7] hover:from-[#D0E5F5] hover:to-[#5A8FB7] text-[#0A1931] shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 lg:gap-3"
            >
              <ProductsIcon />
              <span>Products</span>
            </Button>
          </Link>
          <Link href="/portfolio" className="w-full lg:w-72">
            <Button
              size="lg"
              className="w-full lg:w-72 h-20 lg:h-24 text-xl lg:text-2xl font-bold bg-gradient-to-br from-[#4A7FA7] to-[#1A3D63] hover:from-[#5A8FB7] hover:to-[#2A4D73] text-white shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 lg:gap-3"
            >
              <PortfolioIcon />
              <span>Portfolio</span>
            </Button>
          </Link>
          <Button
            size="lg"
            className="w-full lg:w-72 h-20 lg:h-24 text-xl lg:text-2xl font-bold bg-gradient-to-br from-[#1A3D63] to-[#0A1931] hover:from-[#2A4D73] hover:to-[#1A2941] text-[#B3CFE5] shadow-2xl rounded-3xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <SyncingIcon />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <SyncIcon />
                <span>Sync Data</span>
              </>
            )}
          </Button>
        </div>

        {/* Last synced info */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6 max-w-2xl mx-auto shadow-lg">
          <p className="text-[#B3CFE5] font-medium mb-3">
            ⏱️ Terakhir disinkronkan: <span className="text-white font-semibold">{formattedLastSynced}</span>
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3"></div>
          <p className="text-white/80 flex items-center justify-center gap-2">
            {isOnline 
              ? (
                <>
                  <div className="w-5 h-5 flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <span>Terhubung ke internet - Data dapat diperbarui</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 flex-shrink-0">
                    <PhoneIcon />
                  </div>
                  <span>Mode offline - Menggunakan data tersimpan</span>
                </>
              )
            }
          </p>
        </div>

        {/* PWA install prompt */}
        <div className="mt-10 text-center">
          <p className="text-sm text-white/60 font-medium backdrop-blur-sm">
            💡 Tips: Klik menu 3 titik di browser untuk "Install app"
          </p>
        </div>
      </div>

      {/* Sync message */}
      {showMessage && syncMessage && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#0A1931]/95 backdrop-blur-sm border border-[#B3CFE5]/30 text-white px-8 py-4 rounded-full shadow-2xl z-50 font-medium mx-4">
          {syncMessage}
        </div>
      )}

      {/* Sync Progress Modal */}
      <SyncModal 
        isOpen={isSyncModalOpen} 
        progress={syncProgress} 
        message={syncStatus} 
      />
    </main>
  );
}