// HiPo AI Coach Service Worker - Production-Ready for Indian Mobile Users
// Fixed critical issues: production assets, SPA navigation, secure caching, IndexedDB analytics

const CACHE_NAME = 'hipo-coach-v2';
const RUNTIME_CACHE = 'hipo-runtime-v2';
const ANALYTICS_DB = 'hipo-analytics';
const ANALYTICS_STORE = 'events';

// Safe list of API endpoints that can be cached (public data only)
const CACHEABLE_API_PATTERNS = [
  '/api/coaches',    // Coach list is public
  '/api/health',     // Health checks
  '/api/analytics'   // Analytics endpoint only
];

// Sensitive patterns that should NEVER be cached
const SENSITIVE_API_PATTERNS = [
  '/api/chat',       // Chat messages contain personal data
  '/api/user',       // User data is sensitive
  '/api/auth',       // Authentication data
  '/api/profile'     // Profile data is personal
];

// Core app shell that works offline (dynamic discovery approach)
const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache app shell only
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Installing HiPo Coach service worker v2');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('📦 SW: Caching app shell for offline use');
        
        // Cache app shell resources that we know exist
        const cachePromises = APP_SHELL_URLS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`✅ SW: Cached ${url}`);
            }
          } catch (error) {
            console.warn(`⚠️ SW: Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        
        // Pre-cache the main page for SPA navigation
        try {
          const indexResponse = await fetch('/');
          if (indexResponse.ok) {
            await cache.put('/', indexResponse);
            console.log('✅ SW: Cached index.html for SPA navigation');
          }
        } catch (error) {
          console.warn('⚠️ SW: Failed to cache index.html:', error);
        }
      })
      .then(() => {
        // Force activation for immediate control
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activating HiPo Coach service worker v2');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE &&
              cacheName.startsWith('hipo-') // Only delete our caches
            )
            .map((cacheName) => {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim(),
      // Initialize analytics database
      initAnalyticsDB()
    ])
  );
});

// Fetch event - implement proper caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external origins
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Strategy 1: Handle SPA navigation (CRITICAL FIX)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Strategy 2: Handle API requests with security
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Strategy 3: Handle static assets (Vite production files)
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.includes('.js') || 
      url.pathname.includes('.css') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.ico')) {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Strategy 4: Handle other requests with stale-while-revalidate
  event.respondWith(handleOtherRequests(request));
});

// SPA Navigation Handler - serves cached index.html for offline deep links
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    
    // Cache successful navigation response
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/', response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed - serve cached index.html for SPA routing
    console.log('📡 SW: Navigation offline, serving cached SPA shell');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HiPo Coach - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center; 
              padding: 20px; 
              background: #f5f5f5;
            }
            .offline-container {
              max-width: 400px;
              margin: 50px auto;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>🔄 HiPo Coach</h1>
            <p>You're currently offline. Please check your internet connection.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// API Request Handler - secure caching with sensitivity check
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Check if this API endpoint contains sensitive data
  const isSensitive = SENSITIVE_API_PATTERNS.some(pattern => 
    url.pathname.includes(pattern)
  );
  
  // Check if request has authorization headers (sensitive)
  const hasAuth = request.headers.get('Authorization') || 
                  request.headers.get('Cookie');
  
  // Don't cache sensitive or authenticated requests
  if (isSensitive || hasAuth) {
    try {
      return await fetch(request);
    } catch (error) {
      console.log('📡 SW: Sensitive API request failed offline');
      return new Response(JSON.stringify({ 
        error: 'Offline - This feature requires internet connection',
        offline: true 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For cacheable public APIs, use network-first with cache fallback
  const isCacheable = CACHEABLE_API_PATTERNS.some(pattern => 
    url.pathname.includes(pattern)
  );
  
  if (isCacheable) {
    try {
      const response = await fetch(request);
      
      // Cache successful responses
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // Fallback to cached version
      console.log('📡 SW: Network failed, checking cache for:', url.pathname);
      const cache = await caches.open(RUNTIME_CACHE);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log('💾 SW: Serving stale API data:', url.pathname);
        return cachedResponse;
      }
      
      // No cache available
      return new Response(JSON.stringify({ 
        error: 'Offline - No cached data available',
        offline: true 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // For non-cacheable APIs, just try network
  return fetch(request);
}

// Static Assets Handler - cache Vite production builds
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first for static assets
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('💾 SW: Serving cached asset:', request.url);
    return cachedResponse;
  }
  
  // Fetch and cache asset
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      console.log('📦 SW: Cached new asset:', request.url);
    }
    return response;
  } catch (error) {
    console.log('📡 SW: Asset failed to load:', request.url);
    // For critical assets, return a minimal fallback
    if (request.url.includes('.css')) {
      return new Response('/* Offline fallback CSS */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    throw error;
  }
}

// Other Requests Handler - stale-while-revalidate
async function handleOtherRequests(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  // Get cached version immediately
  const cachedResponse = await cache.match(request);
  
  // Fetch updated version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse);
  
  // Return cached immediately, or wait for network if no cache
  return cachedResponse || fetchPromise;
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    console.log('📊 SW: Syncing analytics data');
    event.waitUntil(syncStoredAnalytics());
  }
});

// Initialize IndexedDB for analytics storage
async function initAnalyticsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ANALYTICS_DB, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ANALYTICS_STORE)) {
        const store = db.createObjectStore(ANALYTICS_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Store analytics event in IndexedDB
async function storeAnalyticsEvent(event) {
  try {
    const db = await initAnalyticsDB();
    const transaction = db.transaction([ANALYTICS_STORE], 'readwrite');
    const store = transaction.objectStore(ANALYTICS_STORE);
    
    await new Promise((resolve, reject) => {
      const request = store.add({
        ...event,
        timestamp: Date.now(),
        synced: false
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await self.registration;
      registration.sync.register('analytics-sync');
    }
  } catch (error) {
    console.warn('Failed to store analytics event:', error);
  }
}

// Sync stored analytics events when online
async function syncStoredAnalytics() {
  try {
    const db = await initAnalyticsDB();
    const transaction = db.transaction([ANALYTICS_STORE], 'readwrite');
    const store = transaction.objectStore(ANALYTICS_STORE);
    
    // Get unsynced events
    const unsyncedEvents = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const events = request.result.filter(event => !event.synced);
        resolve(events);
      };
      request.onerror = () => reject(request.error);
    });
    
    // Send events to analytics endpoint
    for (const event of unsyncedEvents) {
      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        
        if (response.ok) {
          // Mark as synced
          const updateTransaction = db.transaction([ANALYTICS_STORE], 'readwrite');
          const updateStore = updateTransaction.objectStore(ANALYTICS_STORE);
          event.synced = true;
          updateStore.put(event);
        }
      } catch (error) {
        console.warn('Failed to sync analytics event:', error);
        break; // Stop syncing if network is down
      }
    }
    
    console.log(`📊 SW: Synced ${unsyncedEvents.length} analytics events`);
  } catch (error) {
    console.error('❌ SW: Analytics sync failed:', error);
  }
}

// Listen for analytics events from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ANALYTICS_EVENT') {
    storeAnalyticsEvent(event.data.payload);
  }
  
  if (event.data && event.data.type === 'SYNC_ANALYTICS') {
    syncStoredAnalytics();
  }
});

// Push notifications for coaching reminders
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Your HiPo coach has new insights for you',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'coaching-reminder',
      data: { url: data.url || '/' },
      requireInteraction: false,
      silent: false
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'HiPo Coach', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log('🎯 SW: HiPo Coach service worker v2 loaded - Production ready for Indian mobile users!');