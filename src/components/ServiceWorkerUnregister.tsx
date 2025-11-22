"use client";

import { useEffect } from "react";

export function ServiceWorkerUnregister() {
  useEffect(() => {
    async function unregisterServiceWorkers() {
      if ("serviceWorker" in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length) {
            console.log("Unregistering existing service workers...");
            for (const registration of registrations) {
              await registration.unregister();
              console.log(`Service worker with scope ${registration.scope} unregistered.`);
            }
          }

          const cacheKeys = await caches.keys();
          if (cacheKeys.length) {
            console.log("Clearing all caches...");
            for (const key of cacheKeys) {
              await caches.delete(key);
              console.log(`Cache ${key} deleted.`);
            }
          }
          
          console.log("Forcing a hard reload to apply changes.");
          window.location.reload(true);

        } catch (error) {
          console.error("Error during service worker unregistration or cache clearing:", error);
        }
      }
    }

    // Run this cleanup logic only once
    if (!localStorage.getItem("sw_cleanup_done")) {
      unregisterServiceWorkers();
      localStorage.setItem("sw_cleanup_done", "true");
    }
  }, []);

  return null;
}
