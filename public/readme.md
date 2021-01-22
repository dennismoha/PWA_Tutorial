# Always add a web manifest file to the root folder
* You need to add manifest file to every view page on your browser to make sure browser is able to load manifest with additional configuration to every url you visit.
 * in the manifest files, display can either be:

       | standalone                |  full-screen         | minimal-ul             | Browser
       |-------------------------- | -------------------- | ---------- ----------  |-------------------------|
       | behaves like a native app | where it covers the  |  feels like a reduced  |it'll open like a normal |
       |                           | whole phone screen   |  a reduced native app  |webpage in the browser   |
       |                           |                      |  but with reduced UI   |                         |
       |                           |                      |   elements             |                         |



* The orientation can be : 
> * 1)  __any__ - which allows the user to choose either portrait or landscape.
> * 2) either portrait or landscape,
> * 3)  portrait-primary -makes sure it doesn't switch if the user rotates the device by 180degrees"


* __dir__ : how is your pwa aligned? either left to right or vice versa
* __make sure to copy manifest in all the pages you are loading__

___

* Listenable service worker events: Fetch, push notifications, notification interaction, background sync, service worker lifecycle.

* the service worker register also takes another option.the scope option that depicts which scope it should operate
  `.register('../sw.js',{scope:'/help/'}) ;` it will only be operable in the help file . Example

 ``` fetch('https://httpbin.org/ip')
    .then((data) => { console.log('data is ', data); return data.json() })
     .then(datas => console.log(datas))
     .catch(error => console.log('error ', error));
 ```
___  

```fetch('https://httpbin.org/post', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
         },
        mode: 'cors', //it can also be mode:'no-cors' in order to circumvent the cors errors
        body: JSON.stringify({
            message: " this is the test body"
        })
    })
    .then(data => { return data.json() })
    .then(datass => console.log(datass.data))
    .catch(error => { console.log(error) })
```

___
```fetch('https://swapi.dev/api/planets/2/')
    .then(data => console.log(data))
    .catch(error => console.log(error))
```

## rendering a not available page /404 error page incase the network is down 
* 1) create a online.html
* 2) copy paste from the index.html in order to maintain the skeleton lookout of the app
* 3) remove feed.js and feed.css in order to make the page unapdatable
* 4) then go to our serwice worker registration and add the './offline.html' in the list of cache.add
* 5) go to the fetch section and in the catch, return the offline page by first opening the cache, retrieving it using the match keyword and then returning it

## caching strategy
### 1) cache with network fallback
* page sends a request to the servicec worker or we can say , the service worker intercepts any request the page sends
* then the service worker has a look at the cache
* if a resource is found it is directly returned and if not the service worker reaches the network which returns the response
* then we step with the service worker and put that request in the dynamic caching. which means, any request that wasn't cached during service worker startup
* will get cached in the dynamic cache which means for future requests,we can find the resource in the cache
#### disadvantage 
* for resources which should be highly upto date,we might return old versions which are still in the cache because because we don't reach out to the network by default
* only if an element is not in the cache.
* __Example
  ```  
    self.addEventListener('fetch', (e) => {
        fetch(e.request)
            .then((res) => {
                return caches.open(dynamicCache)
                    .then((cache) => {
                        cache.put(e.request.url, res.clone()) //preinstall the resource in the cache once we get it from the internet
                        return res;
                    })
            })
        e.respondWith(
            fetch(e.request) //we first reach the internet
            .catch((err) => { return caches.match(e.request) }) //if it fails we reach the cache

        );
    })
  ```

### 2) cache only
* service worker intercepts a page resource ,and then looks at the cache. if we find a resource there we return
* it to the page.we ignore the network. Example is below

 ```  self.addEventListener('fetch', (e) => {
                        e.respondWith(
                                caches.match(e.request)
                                .then(response => {
                                return response
                                }).catch(error => console.log(error))
                        );
                        })
 ```                        
                     
* this might not be the best startegy to use or only the best for certain types of requests
#### disadvantage
* not applicable for offline access due to lack of dynamic caching

### 3) Network only
> this is the opposite of cache only. Here we don't use a sevice worker at all but instead the page sends a request to the network
and we return that. example
```
                self.addEventListener('fetch', (e) => {
                e.respondWith(
                        fetch(e.request)
                );
                })
```
                
* __this is only valid for limited number of resources__

### 4) Network with cache fallback
> * we catch a request in a service worker and the try to reach out to the network and only if that fetch fails
> * we reach to the assets from the cache and return the asset from the cache

#### disadvantage

> * when it comes to poor connections where  requests turn off after every short while eg 60secs, it'll take 60secs  more for it
> * to reach the cache. which results in a bad user experience
>  * Examples:
  
 ``` self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request) //we first reach the internet
        .catch((err) => { return caches.match(e.request) }) //if it fails we reach the cache

    );
})
```
> * example 2 : where we can apply dynamic caching to it
``` self.addEventListener('fetch', (e) => {
    fetch(e.request)
        .then((res) => {
            return caches.open(dynamicCache)
                .then((cache) => {
                    cache.put(e.request.url, res.clone()) //preinstall the resource in the cache once we get it from the internet
                    return res;
                })
        })
    e.respondWith(
        fetch(e.request) //we first reach the internet
        .catch((err) => { return caches.match(e.request) }) //if it fails we reach the cache

    );
})
```

### 5) cache then network
> * the idea is to get an asset as quickly as possible from the cache and then also try to fetch a more upto date version from the network
> * this way we can present something to the user quickly and still get an update version if the network is available.
> * this is an improved version of the network first callback cache version.
> * here we don't wait for something to get served from the cache, if the network is unsuccesful we have the cache and if successful we ovveride what
> * we have in the cache

#### procedure
> * 1) page directly reaches out to the cache
> * 2) we then get the value back NB: no service worker has been involved here yet
> __we also use some variable to see if a network response is arleady there beacuase incase the network is faster than us retrieving data from cache, we don't want to ovveride the network response with the cache response__
> * 3) we also reach out to the service worker and this happens simultaneously to the page reaching the cache
> * 4) the service worker will then reach the network and try get a response from there .
> * 5) __(optional)__ the network response then goes back to the service worker and we store the response in the cache if we are using dynamic caching although it's optional
> * 6) then we return the fetch data to the page

> #### __3 Implementation__ 
> * for this strategy we need to work in both our normal javascript files and the service workers
> __NB: json data shouldn't be stored in the cache__
> * in our case , the normal javascript file is the seed.js
> *   Example:
 ```
 /here we are implementing the cache then network strategy
url2 = 'https://httpbin.org/get';
var networkDataReceived = false; //the variable that controls where app requests for the data

function clearCards() { //clears any unusedd cache returned from the cache if network had returned or vice versa
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
    }
}

fetch(url2) //fetches data from the network
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        networkDataReceived = true; //if data is received from the network,network data is set to true and it won't reach the cache for data
        console.log('data from web ', data)
        clearCards();
        createCard();
    });

if ('caches' in window) { //feteches data from the cache
    caches.match(url2)
        .then((response) => { //incase you don't find it in the cache the result will be null response
            if (response) {
                return response.json();
            }
        })
        .then((data) => {
            console.log('from cache storage', data)
            if (!networkDataReceived) { //if network is still false, the app will reach to the cache section
                console.log('data from cache ', data)
                clearCards();
                createCard()
            }
        })
} else {
    console.log('no cache in window')
}
    
```
> * then below we can set dynamic caching for it in the serviceworker.js file
```
 //dynamic caching implementation for cache then network strategy
self.addEventListener('fetch', (e) => { //this intercepts all the requests including those sent by the javascript 
    url2 = 'https://httpbin.org/get';
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
```
> * __option 2 on dynamic caching__
```
var cachesurl = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/offline.html',
    '/src/js/material.min.js',
] 
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
    url2 = 'https://httpbin.org/get';
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

```

---
# DYANMIC CACHING VS CACHING DYNAMIC CONTENT
> * __caching dyanmic content__ simply means storing json data mostly from the server which is either in json / xml format. 
> * This is stored in the browser's indexdb
> * __DYNAMIC CACHING__ simply means adding assets/files/ resources dynamically to your cache when you get them from the server after a fetch request    or during installation 
# __Index DB__ 
* Key value database used to store the main content of your app. not the files /css but the json /xml content which is the meat of your application.
* It's a transactional database running in the browser and not the server . Transactional simply means if one of the actions to the given transaction fails,none of the actions are applied in order to maintain the database integrity
* You can store unstructred data here too..eg blobs and images
* it can be accessed asynchronouslu
* you can have multiple databases but one per application
* The indexdb API is a bit clunky and there we use this js script **idb** by on this url `https://github.com/adampoczatek/IDB`
* Once with idb in place we need to use it in our serviceworker.js file and the index html file
* in our service worker, we include it using `importScripts` which is used by servie worker to include other scripts
* The strategies are simmilar to the cache strategy above only difference being, here we eliminate the cache API and instead use the Index db.
* __Dynamic content__ is data that changes frequently

## creating Indexdb
> we create idexdb on the service worker file after idb file is imported
> * the first line takes three paramters.. 1) name of the database, the version of the database and a callback function which is neccessary and operates each time a new database is created
> * second line checks if we contain a database with a simmilar name
> * if not we create a table which is an objec wih parameters we want
```
var dbPromise = idb.open('post-store', 1, (db) => {
    if (!db.objectStoreNames.contains('post-store')) {
        db.createObjectstore('posts', { keyPath: 'id' })
    }
})

```



    