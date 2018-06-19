console.log(this);

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    './',
    './main.css'
];

self.addEventListener('install', function (event) {
    // Perform install steps
    console.log(event);
    event.waitUntil(caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        }).catch(function(err) {
            console.error(err);
        })
    );
});

self.addEventListener('fetch', function (event) {
    console.dir(event.request);

    if (event.request.url.indexOf(".jpg") >= 0) {
        event.respondWith(
            fetch("https://www.example.com/bild.jpg", {
                mode: "no-cors"
            })
        );
    } else if(event.request.url.indexOf(".html") >= 0 | event.request.url.indexOf(".css") >= 0) {

        event.respondWith(caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    return response;
                } else {
                    return fetch(event.request);
                }
            })
        );
    }
});
