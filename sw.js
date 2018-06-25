self.addEventListener('install', function (event) {
    var root = event.target.self.registration.scope;
    var version = 'v1::';
    console.log('install');
    // Perform install steps
    /*  The caches built-in is a promise-based API that helps to cache responses,
        as well as finding and deleting them.
    */
    var cachePromise = caches
    /*  You can open a cache by name, and this method returns a promise. We use
        a versioned cache name here so that we can remove old cache entries in
        one fell swoop later, when phasing out an older service worker.
    */
        .open(version + 'test-site-cache-v1');

    event.waitUntil(cachePromise
        .then(function (cache) {
            console.log('Opened cache');
            /* After the cache is opened, fill it with the offline fundamentals.
               The method below will add all resources which are indicated to the cache,
               after making HTTP requests for each of them.
            */
            return cache.addAll([
                '/',
                '/css/main.css',
                '/js/test.js'
            ]);
        }).then(function () {
            console.log('SERVICE WORKER: install completed');
        }).catch(function (err) {
            console.log(err);
        })
    );
});

self.addEventListener('fetch', function (event) {
    var eventReq = event.request;
    console.log('fetch');
    console.log(event.request.url);

    // event.respondWith(new Response("Das ist ein neuer Inhalt"));

    if (event.request.method !== 'GET') {
        /* If it don't block the event as shown below, then the request will go to
           the network as usual.
        */
        console.log('WORKER: fetch event ignored.', eventReq.method, eventReq.url);
    } else {
        if (eventReq.url.indexOf(".bar") >= 0) {
            event.respondWith(
                fetch("http://i43.tinypic.com/rit92a.jpg", {
                    mode: "no-cors"
                })
            );
        } else {
            var promise = caches.match(event.request);
            event.respondWith(
                promise.then(function (response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    } else {
                        var fetchResult = fetch(event.request);
                        console.log("!!!!!!!!");
                        console.dir(fetchResult);
                        return fetchResult;
                    }
                }).catch(function (err) {
                    console.error(err);
                })
            );
        }
    }
});

self.addEventListener('activate', function (event) {
    console.log('activate');
});