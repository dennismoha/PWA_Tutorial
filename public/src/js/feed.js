var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
    createPostArea.style.display = 'block';
    //check if default prompt is check in order to display the install banner after click
    if (defaultPrompt) {
        defaultPrompt.prompt();
        defaultPrompt.userChoice.then((choiceResult) => { //shows the choice the user picked
            console.log(choiceResult);
            if (choiceResult.outcome === "dismiss") {
                console.log('user cancelled installation')
            } else {
                console.log('user added to home screen')
            }
        });
        defaultPrompt = null;
    }
}

function closeCreatePostModal() {
    createPostArea.style.display = 'none';
}

//in this section.we are writing service workers for client side
//although variables won't be same between sw.js and this file, still cache name might be same since cache storage is one. or different
//this is cacheing the card after the user clicks on save

//unused for now
// function savedButtonOnClick(e) {
//     if ('caches' in window) { //first check if cache is supported by the browser
//         caches.open('user-requested')
//             .then((cache) => { //when the user clicks on the save button, save the image and the url where other data comes from
//                 cache.add('https://httpbin.org/get');
//                 cache.add('/src/images/main-image-sm.jpg');
//             })
//     } else {
//         //you can hide the button , disable it etc
//     }
//     console.log('clicked')
// }

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard() {
    var cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    var cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url("/src/images/main-image-sm.jpg")';
    cardTitle.style.backgroundSize = 'cover';
    cardTitle.style.height = '180px';
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = 'San Francisco Trip';
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = 'In San Francisco';
    cardSupportingText.style.textAlign = 'center';
    // var cardSaveButton = document.createElement('button');
    // cardSaveButton.textContent = "save";
    // cardSaveButton.addEventListener('click', savedButtonOnClick)
    // cardSupportingText.appendChild(cardSaveButton);
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}
//the url is from fireabase..so make sure to add a .json at the end as it's a requirement from firebase in order to target the right api endpoint
url = "https://pwa-sample-144d6-default-rtdb.firebaseio.com/posts.json";


//here we are implementing the cache then network strategy
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