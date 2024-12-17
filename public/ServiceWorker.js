const CACHE_NAME = 'study-planner-cache-v2'; // Updated cache name for versioning

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/Index.html',
                '/HomePage.html',
                '/StudyPlanner.html',
                '/StudyTips.html',
                '/Styles.css',
                '/StudyPlannerHandler.js',
                '/ServiceWorker.js',
                '/Manifest.json',
                '/IconImages/Home24.png',
                '/IconImages/Home48.png',
                '/IconImages/Home96.png',
                '/IconImages/StudyBook24.png',
                '/IconImages/StudyBook48.png',
                '/IconImages/StudyBook96.png',
                '/IconImages/QuestionMark24.png',
                '/IconImages/QuestionMark48.png',
                '/IconImages/QuestionMark96.png',
                '/IconImages/Facebook24.png',
                '/IconImages/Facebook48.png',
                '/IconImages/Facebook96.png',
                '/IconImages/Twitter24.png',
                '/IconImages/Twitter48.png',
                '/IconImages/Twitter96.png',
                '/IconImages/Instagram24.png',
                '/IconImages/Instagram48.png',
                '/IconImages/Instagram96.png',
                '/Fonts/Spectral-Regular.ttf',
                '/Fonts/Spectral-Italic.ttf',
                '/Fonts/Spectral-Bold.ttf',
                '/Fonts/Spectral-BoldItalic.ttf',
                '/Fonts/Spectral-ExtraBold.ttf',
                '/Fonts/Spectral-Light.ttf',
                '/Fonts/Spectral-LightItalic.ttf',
                '/Fonts/Spectral-Medium.ttf',
                '/Fonts/Spectral-MediumItalic.ttf',
                '/Fonts/Spectral-SemiBold.ttf',
                '/Fonts/Spectral-SemiBoldItalic.ttf',
                '/DynamicAssets/LandscapeBackground35sec.mp4',
                '/DynamicAssets/LandscapeSplashScreen4sec.mp4',
                '/DynamicAssets/PortraitBackground35sec.mp4',
                '/DynamicAssets/PortraitSplashScreen4sec.mp4'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Remove old caches
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
