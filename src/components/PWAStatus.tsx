// src/components/PWAStatus.tsx
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAStatus() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (isInstalled) {
    return (
      <div className="fixed top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
        ✅ Aplikasi terinstall
      </div>
    );
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">Install Aplikasi</h3>
          <p className="text-sm opacity-90">
            Install aplikasi untuk akses offline yang lebih baik
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-white text-blue-500 hover:bg-gray-100"
          >
            Install
          </Button>
          <Button
            size="sm"
            onClick={handleDismiss}
            className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-500"
          >
            Nanti
          </Button>
        </div>
      </div>
    </div>
  );
}
