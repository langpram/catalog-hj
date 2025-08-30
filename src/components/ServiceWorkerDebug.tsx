// src/components/ServiceWorkerDebug.tsx
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ServiceWorkerDebug() {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [cacheStatus, setCacheStatus] = useState<string>('Checking...');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [localStorageStatus, setLocalStorageStatus] = useState<string>('Checking...');
  const [cacheDetails, setCacheDetails] = useState<string>('');

  useEffect(() => {
    checkServiceWorker();
    checkCache();
    checkLocalStorage();
    
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const status = registration.active ? 'Running' : 'Waiting';
          setSwStatus(`✅ Active (${status})`);
        } else {
          setSwStatus('❌ Not registered');
        }
      } catch (error) {
        setSwStatus(`❌ Error: ${error}`);
      }
    } else {
      setSwStatus('❌ Not supported');
    }
  };

  const checkCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const catalogCaches = cacheNames.filter(name => 
          name.includes('catalog') || name.includes('app')
        );
        if (catalogCaches.length > 0) {
          setCacheStatus(`✅ Found: ${catalogCaches.join(', ')}`);
          
          // Get cache details
          let details = '';
          for (const cacheName of catalogCaches) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            details += `${cacheName}: ${keys.length} items\n`;
            // Show first few URLs
            const urls = keys.slice(0, 5).map(req => req.url.split('/').pop() || req.url);
            details += `  - ${urls.join(', ')}\n`;
          }
          setCacheDetails(details);
        } else {
          setCacheStatus('❌ No catalog caches found');
          setCacheDetails('');
        }
      } catch (error) {
        setCacheStatus(`❌ Error: ${error}`);
        setCacheDetails('');
      }
    } else {
      setCacheStatus('❌ Not supported');
      setCacheDetails('');
    }
  };

  const checkLocalStorage = () => {
    try {
      const data = localStorage.getItem('offline_catalog_data');
      if (data) {
        const parsed = JSON.parse(data);
        const lastSynced = new Date(parsed.lastSynced).toLocaleString();
        setLocalStorageStatus(`✅ Data available (${lastSynced})`);
      } else {
        setLocalStorageStatus('❌ No offline data');
      }
    } catch (error) {
      setLocalStorageStatus(`❌ Error: ${error}`);
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Custom Service Worker registered:', registration);
        setSwStatus('✅ Registered successfully');
        setTimeout(checkServiceWorker, 1000);
      } catch (error) {
        console.error('Custom Service Worker registration failed:', error);
        setSwStatus(`❌ Registration failed: ${error}`);
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        setCacheStatus('✅ Cache cleared');
        setCacheDetails('');
        console.log('All caches cleared');
        setTimeout(checkCache, 1000);
      } catch (error) {
        console.error('Error clearing cache:', error);
        setCacheStatus(`❌ Error clearing cache: ${error}`);
      }
    }
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('offline_catalog_data');
      setLocalStorageStatus('✅ LocalStorage cleared');
      setTimeout(checkLocalStorage, 1000);
    } catch (error) {
      setLocalStorageStatus(`❌ Error clearing localStorage: ${error}`);
    }
  };

  const testOffline = () => {
    // Simulate offline mode by disabling network in DevTools
    alert('Untuk test offline:\n1. Buka DevTools (F12)\n2. Pilih tab Network\n3. Centang "Offline"\n4. Refresh halaman\n\nAtau matikan WiFi/LAN dan refresh browser');
  };

  const refreshAll = () => {
    checkServiceWorker();
    checkCache();
    checkLocalStorage();
  };

  const forceCacheProductPage = async () => {
    try {
      // Force cache current page
      const currentUrl = window.location.href;
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_PRODUCT_PAGE',
          url: currentUrl
        });
        console.log('Force cache requested for:', currentUrl);
        alert('Cache request sent! Check console for details.');
      }
    } catch (error) {
      console.error('Error forcing cache:', error);
      alert('Error forcing cache: ' + error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">🔧 Service Worker Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Network:</strong> 
          <span className={`ml-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        
        <div>
          <strong>Service Worker:</strong> 
          <span className="ml-2">{swStatus}</span>
        </div>
        
        <div>
          <strong>Cache:</strong> 
          <span className="ml-2">{cacheStatus}</span>
        </div>

        <div>
          <strong>LocalStorage:</strong> 
          <span className="ml-2">{localStorageStatus}</span>
        </div>

        {cacheDetails && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <strong>Cache Details:</strong>
            <pre className="whitespace-pre-wrap">{cacheDetails}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        <Button
          size="sm"
          onClick={registerServiceWorker}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          Register SW
        </Button>
        
        <Button
          size="sm"
          onClick={refreshAll}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Refresh All
        </Button>
        
        <Button
          size="sm"
          onClick={clearCache}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          Clear Cache
        </Button>

        <Button
          size="sm"
          onClick={clearLocalStorage}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          Clear LocalStorage
        </Button>
        
        <Button
          size="sm"
          onClick={testOffline}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Test Offline
        </Button>

        <Button
          size="sm"
          onClick={forceCacheProductPage}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
        >
          Force Cache Page
        </Button>
      </div>
    </div>
  );
}
