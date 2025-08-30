// public/sw.js - Custom Service Worker
console.log('Custom Service Worker: Loading...');

// Nama cache untuk aplikasi
const CACHE_NAME = 'catalog-app-v1';
const API_CACHE_NAME = 'catalog-api-v1';

// Daftar URL yang akan di-cache untuk akses offline
const urlsToCache = [
  '/',
  '/products',
  '/portofolio',
  '/offline',
  '/icons/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/placeholder-image.jpg',
  '/manifest.json'
];

// Event listener untuk instalasi service worker
self.addEventListener('install', (event) => {
  console.log('Custom Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Custom Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Custom Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Custom Service Worker: Install failed', error);
      })
  );
});

// Event listener untuk aktivasi service worker
self.addEventListener('activate', (event) => {
  console.log('Custom Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Custom Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Custom Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Event listener untuk fetch requests
self.addEventListener('fetch', (event) => {
  console.log('Custom Service Worker: Fetching', event.request.url);
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    console.log('Custom Service Worker: Skipping cross-origin request');
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    console.log('Custom Service Worker: Skipping non-GET request');
    return;
  }

  // Skip Next.js internal requests (CSS, JS chunks, etc.)
  if (event.request.url.includes('/_next/') || 
      event.request.url.includes('/static/') ||
      event.request.url.includes('.css') ||
      event.request.url.includes('.js')) {
    console.log('Custom Service Worker: Skipping Next.js internal request');
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    console.log('Custom Service Worker: Handling API request');
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle navigation requests (including product detail pages)
  if (event.request.mode === 'navigate') {
    console.log('Custom Service Worker: Handling navigation request');
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  // Handle other requests
  console.log('Custom Service Worker: Handling static request');
  event.respondWith(handleStaticRequest(event.request));
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    console.log('Custom Service Worker: Handling API request', request.url);
    
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Custom Service Worker: API cached successfully');
      return networkResponse;
    }
  } catch (error) {
    console.log('Custom Service Worker: Network failed for API request', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('Custom Service Worker: Serving API from cache');
    return cachedResponse;
  }

  // Return error response
  console.log('Custom Service Worker: API not available offline');
  return new Response('API data not available offline', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  console.log('Custom Service Worker: Handling navigation request', request.url);
  
  // First, check if we have this exact URL cached
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('Custom Service Worker: Serving exact navigation from cache');
    return cachedResponse;
  }

  try {
    console.log('Custom Service Worker: Trying network for navigation request');
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Custom Service Worker: Navigation cached successfully');
      return networkResponse;
    }
  } catch (error) {
    console.log('Custom Service Worker: Network failed for navigation request', request.url);
  }

  // Special handling for product detail pages
  if (request.url.includes('/product/')) {
    console.log('Custom Service Worker: Product detail page not cached, serving products page');
    const productsPage = await caches.match('/products');
    if (productsPage) {
      return productsPage;
    }
  }

  // Fallback to offline page
  console.log('Custom Service Worker: Serving offline page as fallback');
  const offlinePage = await caches.match('/offline');
  if (offlinePage) {
    return offlinePage;
  }

  // Final fallback to home page
  console.log('Custom Service Worker: Serving home page as final fallback');
  return caches.match('/');
}

// Handle static requests
async function handleStaticRequest(request) {
  console.log('Custom Service Worker: Handling static request', request.url);
  
  // Try cache first for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('Custom Service Worker: Serving static from cache');
    return cachedResponse;
  }

  try {
    // Try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Custom Service Worker: Static asset cached successfully');
      return networkResponse;
    }
  } catch (error) {
    console.log('Custom Service Worker: Network failed for static request', request.url);
  }

  // Return error response
  console.log('Custom Service Worker: Static asset not available offline');
  return new Response('Resource not available offline', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Event listener untuk message dari client
self.addEventListener('message', (event) => {
  console.log('Custom Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Custom Service Worker: Skipping waiting');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_API_DATA') {
    console.log('Custom Service Worker: Caching API data');
    cacheApiData(event.data.data);
  }

  if (event.data && event.data.type === 'CACHE_PRODUCT_PAGE') {
    console.log('Custom Service Worker: Caching product page', event.data.url);
    cacheProductPage(event.data.url);
  }
});

// Function to cache API data
async function cacheApiData(data) {
  try {
    console.log('Custom Service Worker: Starting to cache API data');
    const cache = await caches.open(API_CACHE_NAME);
    
    // Cache banners
    if (data.banners) {
      const bannersRequest = new Request('/api/banners');
      const bannersResponse = new Response(JSON.stringify(data.banners), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(bannersRequest, bannersResponse);
      console.log('Custom Service Worker: Banners cached');
    }
    
    // Cache categories
    if (data.categories) {
      const categoriesRequest = new Request('/api/categories');
      const categoriesResponse = new Response(JSON.stringify(data.categories), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(categoriesRequest, categoriesResponse);
      console.log('Custom Service Worker: Categories cached');
    }
    
    // Cache products by category
    if (data.products) {
      for (const [category, products] of Object.entries(data.products)) {
        const productsRequest = new Request(`/api/products?category=${encodeURIComponent(category)}`);
        const productsResponse = new Response(JSON.stringify(products), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(productsRequest, productsResponse);
        console.log('Custom Service Worker: Products for category', category, 'cached');
      }
    }
    
    // Cache portfolios
    if (data.portfolios) {
      const portfoliosRequest = new Request('/api/portfolios');
      const portfoliosResponse = new Response(JSON.stringify(data.portfolios), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(portfoliosRequest, portfoliosResponse);
      console.log('Custom Service Worker: Portfolios cached');
    }
    
    console.log('Custom Service Worker: API data cached successfully');
  } catch (error) {
    console.error('Custom Service Worker: Error caching API data', error);
  }
}

// Function to cache product page
async function cacheProductPage(url) {
  try {
    console.log('Custom Service Worker: Caching product page', url);
    const cache = await caches.open(CACHE_NAME);
    
    // Fetch the page
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response.clone());
      console.log('Custom Service Worker: Product page cached successfully');
      
      // Notify clients that cache was updated
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'PRODUCT_PAGE_CACHED',
          url: url
        });
      });
    } else {
      console.log('Custom Service Worker: Failed to fetch product page', url, response.status);
    }
  } catch (error) {
    console.error('Custom Service Worker: Error caching product page', error);
  }
}

console.log('Custom Service Worker: Loaded successfully');
