var version = 'v1.0.3::';

self.addEventListener('install', function (event) {
    var cachePromise = caches.open(version + 'site-cache-v1');

    event.waitUntil(cachePromise
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll([
                './',
                './css/main.css',
                './js/test.js'
            ]);
        }).then(function (cache) {
            console.log('SERVICE WORKER: install completed');
            return cache;
        }).catch(function (err) {
            console.log(err);
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
                    console.log(event.request);
                    console.log(response);

                    // Cache hit - return response
                    if (response) {
                        console.log(">>>>>>>");
                        console.log(response);

                        return response;
                    } else {
                        console.log("!!!!!!!!");

                        fetch(event.request).then(function (response) {

                            console.log('WORKER: fetch response from network.', event.request.url);
                            var cacheCopy = response.clone();
                            var pagesPromise = caches.open(version + 'pages');

                            pagesPromise.then(function add(cache) {
                                cache.put(event.request, cacheCopy);
                                return cache;
                            }).then(function (cache) {
                                console.log('WORKER: fetch response stored in cache.', event.request.url);
                                return fetch(event.request);
                            });
                        });

                        //return fetch(event.request);
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

self.addEventListener("activate", function (event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches.keys().then(function (keys) {
            var promises = keys.filter(function (key) {
                return !key.startsWith(version);
            }).map(function (key) {
                return caches.delete(key);
            });

            return Promise.all(promises);
        }).then(function () {
            console.log('WORKER: activate completed.');
        })
    );
});