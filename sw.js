var version = 'v1.0.14::';

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(version + 'site-cache-beta')
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll([
                './',
                './css/main.css',
                './js/test.js'
            ]);
        }).then(function () {
            console.log('SERVICE WORKER: install completed');




            return self.skipWaiting();
        }).catch(function (err) {
            console.log(err);
        })
    );
});

self.addEventListener("activate", function (event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches.keys().then(function (keys) {
            console.log(keys);
            return Promise.all(keys.filter(function (key) {
                return !key.startsWith(version);
            }).map(function (key) {
                return caches.delete(key);
            }));
        }).then(function () {
            console.log('WORKER: activate completed.');
        })
    );
});

self.addEventListener('fetch', function (event) {
    var eventReq = event.request;
    // event.respondWith(new Response("Das ist ein neuer Inhalt"));

    if (eventReq.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', eventReq.method, eventReq.url);
    } else {
        if (eventReq.url.indexOf(".bar") >= 0) {
            event.respondWith(
                fetch("http://i43.tinypic.com/rit92a.jpg", {
                    mode: "no-cors"
                })
            );
        } else {
            event.respondWith(
                caches.match(event.request).then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    } else {
                        fetch(event.request).then(function (response) {
                            console.log('WORKER: fetch response from network.', event.request.url);
                            var eventRequest = event.request;
                            var cacheCopy = response.clone();
                            caches.open(version + 'pages').then(function (cache) {
                                cache.put(eventRequest, cacheCopy);
                                return;
                            }).then(function () {
                                console.log('WORKER: fetch response stored in cache.', event.request.url);
                            });
                        });

                        return fetch(event.request);
                    }
                }).catch((err) => {
                    console.error('WORKER: fetch request failed in both cache and network: ', err);
                    return new Response('<h1>Service Unavailable</h1>', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({
                            'Content-Type': 'text/html'
                        })
                    });
                })
            );
        }
    }
});
