//service worker with cache strategy
importScripts('/src/js/idb.js')

var cacheName = 'v2'
var dynamicCache = "dynamic1"
var cachesurl = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/offline.html',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'

]

self.addEventListener('install', (e) => {
    console.log('app precaching')
    e.waitUntil(
        caches.open(cacheName)
        .then((cache) => {
            cache.addAll(cachesurl);
        })
        .catch(error => console.log('error caching ', error))
    )
});


self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
        .then((keylist) => {
            return Promise.all(keylist.map((key) => {
                if (key !== cacheName && key !== dynamicCache) {
                    console.log('service worker removing old cache ', key)
                    return caches.delete(key)
                }
            }))
        })
    )
    return self.clients.claim();
});


function isInArray(string, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == string) {
            return true
        }
    }
    return false
}

//dynamic caching implementation for cache then network strategy
self.addEventListener('fetch', (e) => { //this intercepts all the requests including those sent by the javascript 
    url2 = '"https://pwa-sample-144d6-default-rtdb.firebaseio.com/posts.json';
    if (e.request.url.indexOf(url2) > -1) {
        e.respondWith(
            caches.open(dynamicCache)
            .then((cache) => {
                return fetch(e.request)
                    .then((res) => {
                        cache.put(e.request, res.clone()) // we have to clone the request here in order to return it for feed.js
                        return res; //returns request to feed.js
                    })
            })
        )

    } else if (isInArray(e.request.url, cachesurl)) {
        e.respondWith(
            caches.match(e.request)
        )
    } else {
        e.respondWith(
            caches.match(e.request)
            .then(response => {
                if (response) {
                    return response //this is returned if caches not null
                } else { //if request not in cache execute this to reach it in the internet
                    return fetch(e.request)
                        .then((res) => {
                            return caches.open(dynamicCache)
                                .then((cache) => {
                                    cache.put(e.request.url, res.clone()) //preinstall the resource in the cache once we get it from the internet
                                    return res;
                                })
                        })
                        .catch((eror) => { //here we return the offline html page incase the object we're offline and the requested object wasn't cached
                            return caches.open(cacheName)
                                .then((cache) => {
                                    if (e.request.headers.get('accept').includes('text/html')) {
                                        return cache.match('/offline.html')
                                    }
                                })
                        })
                }
            })
        );
    }


})

// self.addEventListener('fetch', (e) => {
//     e.respondWith(
//         caches.match(e.request)
//         .then(response => {
//             if (response) {
//                 return response //this is returned if caches not null
//             } else { //if request not in cache execute this to reach it in the internet
//                 return fetch(e.request)
//                     .then((res) => {
//                         return caches.open(dynamicCache)
//                             .then((cache) => {
//                                 cache.put(e.request.url, res.clone()) //preinstall the resource in the cache once we get it from the internet
//                                 return res;
//                             })
//                     })
//                     .catch((eror) => { //here we return the offline html page incase the object we're offline and the requested object wasn't cached
//                         return caches.open(cacheName)
//                             .then((cache) => {
//                                 return cache.match('/offline.html')
//                             })
//                     })
//             }
//         })
//     );
// })

// network with cache fallback
// self.addEventListener('fetch', (e) => {
//     fetch(e.request)
//         .then((res) => {
//             return caches.open(dynamicCache)
//                 .then((cache) => {
//                     cache.put(e.request.url, res.clone()) //preinstall the resource in the cache once we get it from the internet
//                     return res;
//                 })
//         })
//     e.respondWith(
//         fetch(e.request) //we first reach the internet
//         .catch((err) => { return caches.match(e.request) }) //if it fails we reach the cache

//     );
// })

//cache only strategy
// self.addEventListener('fetch', (e) => {
//     e.respondWith(
//         caches.match(e.request)
//         .then(response => {
//             return response
//         }).catch(error => console.log(error))
//     );
// })

//network only strategy
// self.addEventListener('fetch', (e) => {
//     e.respondWith(
//         fetch(e.request)
//     );
// })