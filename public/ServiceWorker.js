self.addEventListener('install', (event) => {//adds an event listener for when it is installe don a device; slef defines that when it is installed
    event.waitUntil(//waits till it is done
        caches.open('study-planner-cache').then((cache) => {//opens the caches and stores the files and images
            return cache.addAll([
                '/',
                '/HomePage.html',
                '/StudyPlanner.html',
                '/StudyTips',
                '/Styles.css',
                '/Script.js',
                '/FaviconImages/cow.jfif',
                '/FaviconImages/cow-48x48.png',
                '/FaviconImages/cow-72x72.png',
                '/FaviconImages/cow-96x96.png',
                '/FaviconImages/cow-144x144.png',
                '/FaviconImages/cow-192x192.png',
                '/FaviconImages/cow-512x512.png',
                '/Manifest.json',
                '/IconImages/Home24.png',
                '/IconImages/Home48.png',
                '/IconImages/Home96.png',
                '/IconImages/StudyBook24.png',
                '/IconImages/StudyBook48.png',
                '/IconImages/StudyBook96.png',
                '/Fonts/Spectral-Regular.ttf',
                '/Fonts/Spectral-Italic.ttf',
                '/Fonts/Spectral-Bold.ttf',
                '/Fonts/Spectral-BoldItalic.ttf',
                '/Fonts/Spectral-ExtraBold.ttf',
                '/Fonts/Spectral-ExtraBoldItalic.ttf',
                '/Fonts/Spectral-Light.ttf',
                '/Fonts/Spectral-LightItalic.ttf',
                '/Fonts/Spectral-Medium.ttf',
                '/Fonts/Spectral-MediumItalic.ttf',
                '/Fonts/Spectral-SemiBold.ttf',
                '/Fonts/Spectral-SemiBoldItalic.ttf',
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
