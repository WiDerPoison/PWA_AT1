document.addEventListener('DOMContentLoaded', () => {
    const portraitScreen = document.getElementById('splash-screen-portrait');
    const landscapeScreen = document.getElementById('splash-screen-landscape');
    const portraitVideo = document.getElementById('portrait-video');
    const landscapeVideo = document.getElementById('landscape-video');
  
    const minDuration = 2000; // Minimum duration in ms
    const maxDuration = 4000; // Maximum duration in ms
    const startTime = Date.now();
  
    // Function to end splash screen
    function endSplashScreen() {
      portraitScreen.style.display = 'none';
      landscapeScreen.style.display = 'none';
      window.location.href = 'HomePage.html'; // Redirect to the main page
    }
  
    // Detect orientation and play the correct video
    function handleOrientationChange() {
      if (window.matchMedia('(orientation: portrait)').matches) {
        portraitScreen.style.display = 'flex';
        landscapeScreen.style.display = 'none';
        portraitVideo.play();
      } else {
        portraitScreen.style.display = 'none';
        landscapeScreen.style.display = 'flex';
        landscapeVideo.play();
      }
    }
  
    // Event listener for orientation changes
    window.addEventListener('resize', handleOrientationChange);
  
    // Initial orientation check
    handleOrientationChange();
  
    // Handle splash video end or timeout
    const activeVideo = window.matchMedia('(orientation: portrait)').matches ? portraitVideo : landscapeVideo;
  
    activeVideo.addEventListener('ended', () => {
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= minDuration) {
        endSplashScreen();
      }
    });
  
    setTimeout(() => {
      endSplashScreen();
    }, maxDuration);
  });
  