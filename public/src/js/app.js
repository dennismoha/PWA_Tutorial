// var dbPromise = idb.open('post-store', 1, (db) => {
//     if (!db.objectStoreNames.contains('post-store')) {
//         db.createObjectstore('posts', { keyPath: 'id' })
//     }
// })

// if (!('indexedDB' in navigator)) {
//     console.log('This browser doesn\'t support IndexedDB');

// } else {

//     console.log('index db available')
// }

// var request = window.indexedDB.open("databaes", 3, (upgrade) => {
//     console.log('building a database store')
// });

var defaultPrompt;
if (!window.Promise) { //this is for older browsers. enables promise 
    window.Promise = promise; //this is from the promise polyfill
}

if ("serviceWorker" in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('../sw.js')
            .then(reg => console.log('service worker registered successfully'))
            .catch(error => console.log(error, "error registering service worker"))
    })
} else {
    console.log('service worker is not available')
}



//controlling when to show the install banner
window.addEventListener('beforeinstallprompt', (e) => { //triggered by chrome before the install banner is shown
    e.preventDefault(); //chrome wouldn't show the banner
    defaultPrompt = e;
    return false
})