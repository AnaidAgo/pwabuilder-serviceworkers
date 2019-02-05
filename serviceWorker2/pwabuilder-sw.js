// This is the "Offline copy of pages" service worker

const CACHE = "pwabuilder-offline";

// Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener("install", function (event) {
  console.log("[PWA Builder] Install Event processing");
  
  const indexPage = new Request("index.html");
  event.waitUntil(
    fetch(indexPage).then(function (response) {
      return caches.open(CACHE).then(function (cache) {
        console.log("[PWA Builder] Cached index page during Install " + response.url);
        return cache.put(indexPage, response);
      });
    })
  );
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        console.log("[PWA Builder] add page to offline cache: " + response.url);

        // If request was success, add or update it in the cache
        event.waitUntil(updateCache(event.request, response.clone()));

        return response;
      })
      .catch(function (error) {
        console.log("[PWA Builder] Network request Failed. Serving content from cache: " + error);
        return fromCache(event.request);
      })
  )
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return error page
  return caches.open(CACHE).then(function (cache) {
    cache.match(event.request).then(function (matching) {
      return !matching || matching.status == 404
        ? Promise.reject("no-match")
        : matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}