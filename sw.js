console.log("SW Startup!");

var version = 'v1.0.22::';

// Install Service Worker
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(version + 'site-cache-beta')
        .then(function (cache) {
            console.log('Opened cache');

            cache.addAll([
                './',
                './css/main.css',
                './js/test.js',
                'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js'
            ]);

            return cache;
        }).then(function (cache) {
            console.log('SERVICE WORKER: install completed');

            cache.keys().then(function (cacheNames) {
                console.dir(cacheNames);
            });

            return self.skipWaiting();
        }).catch(function (err) {
            console.log(err);
        })
    );
});

// Service Worker Active
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
    // console.log(eventReq.headers);

    if (eventReq.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', eventReq.method, eventReq.url);
        event.respondWith(new Response("Das ist kein gültiger Inhalt..."));
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
                    return response;

                    // if (response) {
                    //     console.log('###############' + response);
                    //     return response;
                    // } else {
                    //     fetch(event.request).then(function (response) {
                    //         console.log('WORKER: fetch response from network.', event.request.url);
                    //         var eventRequest = event.request;
                    //         var cacheCopy = response.clone();
                    //         caches.open(version + 'pages-cache-beta').then(function (cache) {
                    //             cache.put(eventRequest, cacheCopy);
                    //             return;
                    //         }).then(function () {
                    //             console.log('WORKER: fetch response stored in cache.', event.request.url);
                    //         });
                    //     });
                    //
                    //     return fetch(event.request);
                    // }
                }).catch((err) => {
                    console.error('WORKER: fetch request failed in both: cache and network: ', err);
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

self.addEventListener('sync', (event) => {
    if (event.tag == 'eventx') {
        event.waitUntil(doSomething());
    }

    function doSomething() {
        return new Promise(
            function (resolve, reject) {
                var interval = setInterval(timerFn, 3000);

                function timerFn() {
                    fetch('http://localhost:8088', {
                        mode: "no-cors"
                    })
                    .then(function (response) {
                        console.log(response);
                        clearInterval(interval);
                        resolve(response);
                    })
                    .catch(function (error) {
                        console.error('### OFFLINE ###');
                        reject(error);
                    });
                }
            }
        );
    }
});

self.addEventListener('message', async function (event) {
    console.log("SW Received Message: " + event.data);
    const client = event.source;
    client.postMessage(`Pong: ${ event.data }`);

    const clients = await self.clients.matchAll();

    for (const c of clients) {
        if (c !== client) {
            console.log(c);
            //c.postMessage(`Message from ${ messageSource.id }: ${ evt.data }`);
        }
    }

}, false);

self.addEventListener('push', function (event) {
    console.log('Received a push event', event);

    const options = {
        title: 'I got a message for you!',
        body: 'Here is the body of the message',
        icon: '/img/icon-192x192.png',
        tag: 'tag-for-this-notification',
    };

    event.waitUntil(
        self.registration.showNotification(event.data, options)
    )
});