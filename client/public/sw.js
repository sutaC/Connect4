const cacheName = "app-cache-v1";
const cacheLimit = 30;

const noCacheList = ["api", "online"];

// Functions
async function handleInstall() {
    console.log("Service worker installed succesfully!");
    caches.delete(cacheName);
}

async function handleActivate() {
    console.log("Service worker activated succesfully!");
}

// Fetch functions

async function limitCache() {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= cacheLimit) return;

    for (
        let i = keys.length, idx = 0;
        i > cacheLimit && idx < keys.length;
        i-- && idx++
    ) {
        await cache.delete(keys[idx]);
    }
}

function isNoCache(req) {
    if (req.method !== "GET") {
        return true;
    }

    noCacheList.forEach((banned) => {
        if (String(req.url).indexOf(banned) > -1) return true;
    });

    return false;
}

async function handleResponse(event) {
    let fetchRes;
    try {
        fetchRes = await fetch(event.request);
    } catch (error) {
        const cacheRes = await caches.match(event.request);
        return cacheRes || fetchRes;
    }

    if (isNoCache(event.request)) {
        return fetchRes;
    }

    try {
        const cache = await caches.open(cacheName);
        await cache.put(event.request, fetchRes.clone());
        limitCache();
    } catch (error) {
        console.error(error);
    } finally {
        return fetchRes;
    }
}

async function handleFetch(event) {
    event.respondWith(handleResponse(event).then((res) => res));
}

// Listeners
self.addEventListener("install", handleInstall);
self.addEventListener("activate", handleActivate);
self.addEventListener("fetch", handleFetch);
