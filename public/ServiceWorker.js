self.addEventListener('install', (event) => {//adds an event listener for when it is installe don a device; slef defines that when it is installed
    event.waitUntil(//waits till it is done
        caches.open('study-planner-cache').then((cache) => {//opens the caches and stores the files and images
            return cache.addAll([
                '/',
                '/Index.html',
                '/Styles.css',
                '/Script.js',
                '/Icons/cow.jfif',
                "/Icons/cow-48x48.png",
                "/Icons/cow-72x72.png",
                "/Icons/cow-96x96.png",
                "/Icons/cow-144x144.png",
                "/Icons/cow-192x192.png",
                "/Icons/cow-512x512.png",
                '/Manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {//addns another event listener fir fetch
    event.respondWith(//completes if the listener is triggered
        caches.match(event.request).then((response) => {//checks if the reuqtes matches the caches then responds with it 
            return response || fetch(event.request);//without needing to spend more time looking for it
        })
    );
});
