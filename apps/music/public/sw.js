// Service Worker for Music PWA
// Provides audio pre-caching and HTTP 206 (Range Request) support for continuous background playback

const CACHE_VERSION = 'music-audio-v1';
const AUDIO_CACHE_NAME = 'music-audio-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== AUDIO_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// Precache an audio URL into cache storage
async function precacheAudio(url) {
  if (!url) return;
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (!existing) {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        await cache.put(url, response);
      }
    }
  } catch (err) {
    console.warn('[SW] Precache failed for:', url, err);
  }
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'PRECACHE_AUDIO' && data.url) {
    event.waitUntil(precacheAudio(data.url));
  } else if (data.type === 'CLEAR_AUDIO_CACHE') {
    event.waitUntil(caches.delete(AUDIO_CACHE_NAME));
  }
});

// Helper to handle Range Requests (HTTP 206) from full cached or fetched response
async function handleRangeRequest(request, fullResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return fullResponse;
  }

  const arrayBuffer = await fullResponse.arrayBuffer();
  const totalLength = arrayBuffer.byteLength;

  // Range format: "bytes=start-end" or "bytes=start-"
  const matches = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
  if (!matches) {
    return new Response(arrayBuffer, {
      status: 200,
      headers: fullResponse.headers,
    });
  }

  const start = parseInt(matches[1], 10);
  const end = matches[2] ? parseInt(matches[2], 10) : totalLength - 1;

  if (start >= totalLength || end >= totalLength || start > end) {
    return new Response(null, {
      status: 416,
      headers: {
        'Content-Range': `bytes */${totalLength}`,
      },
    });
  }

  const slicedBuffer = arrayBuffer.slice(start, end + 1);
  const headers = new Headers(fullResponse.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${totalLength}`);
  headers.set('Content-Length', String(slicedBuffer.byteLength));
  headers.set('Accept-Ranges', 'bytes');
  if (!headers.get('Content-Type')) {
    headers.set('Content-Type', 'audio/mpeg');
  }

  return new Response(slicedBuffer, {
    status: 206,
    statusText: 'Partial Content',
    headers: headers,
  });
}

function isAudioRequest(request) {
  const url = request.url;
  return (
    request.destination === 'audio' ||
    url.includes('.public.blob.vercel-storage.com') ||
    url.match(/\.(mp3|m4a|wav|ogg|flac|aac)(\?.*)?$/i)
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET' || !isAudioRequest(request)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      const cachedResponse = await cache.match(request.url);

      if (cachedResponse) {
        // Clone cached response to safely read arrayBuffer without consuming original cache
        return handleRangeRequest(request, cachedResponse.clone());
      }

      // If not in cache, fetch from network and store in cache for future seamless playback
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          // Put clean clone in cache
          await cache.put(request.url, networkResponse.clone());
        }
        return handleRangeRequest(request, networkResponse);
      } catch (error) {
        console.error('[SW] Fetch audio failed:', request.url, error);
        throw error;
      }
    })()
  );
});
