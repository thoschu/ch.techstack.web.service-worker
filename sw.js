console.log("SW Startup!");

var version = 'v1.4.1::';

// Install Service Worker
self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(version + 'site-cache-beta')
        .then(function (cache) {
            console.log('Opened cache');

            cache.addAll([
                './index.html',
                './css/main.css',
                './js/test.js',
                './img/offline/offline.png',
                './img/offline/diamant-offline.gif',
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
            console.error(err);
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

    if (eventReq.method !== 'GET' && event.request.mode === 'navigate') {
        console.log('WORKER: fetch event ignored.', eventReq.method, eventReq.url);
        event.respondWith(new Response("Das ist kein gültiger Inhalt, da falsche HTTP-Verb..."));
    } else {
        if (eventReq.url.indexOf(".bar") >= 0) {
            const imgRequest = new Request("http://animaticons.co/wp-content/uploads/animat-diamond-color.gif");

            event.respondWith(
                fetch(imgRequest, {
                    mode: "no-cors"
                }).catch(function(err) {
                    return caches.match('./img/offline/diamant-offline.gif');
                })
            );
        } else {
            event.respondWith(
                fetch(event.request).then(function (response) {
                    var cacheCopy = response.clone();

                    caches.open(version + 'pages-cache-beta').then(function (cache) {
                        console.log('WORKER: fetch response stored in cache.', event.request.url);
                        cache.put(eventReq, cacheCopy);
                    });

                    return response;
                }).catch(err => {
                    console.log(err);

                    return caches.match(event.request).catch(function (err) {
                        console.error(err);
                        return new Response('<h1>Service Unavailable</h1>', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/html'
                            })
                        });
                    });

                })
            );
        }
    }
});


self.addEventListener('sync', (event) => {
    if (event.tag === 'image-fetch') {
        event.waitUntil(function () {
            fetch('http://animaticons.co/wp-content/uploads/animat-diamond-color.gif').then(function (response) {
                return response;
            }).then(function (text) {
                console.log('Request successful', text);
            }).catch(function (error) {
                console.log('Request failed', error);
            });
        });
    }
    
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