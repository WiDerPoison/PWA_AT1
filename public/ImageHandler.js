// Add event listener for image upload
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData();
        const fileInput = document.getElementById('image');
        if (fileInput && fileInput.files[0]) {
            formData.append('image', fileInput.files[0]);

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Image uploaded:', data);
                    fetchImages(); // Refresh the image gallery
                })
                .catch(error => console.error('Error uploading image:', error));
        } else {
            console.error('No file selected for upload');
        }
    });
}

// Fetch and display images
function fetchImages() {
    fetch('/api/images')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const gallery = document.getElementById('image-gallery');
            if (gallery) {
                gallery.innerHTML = ''; // Clear existing images
                data.forEach(image => {
                    const li = document.createElement('li');
                    const img = document.createElement('img');
                    img.src = `/uploads/${image.filename}`;
                    img.alt = 'Uploaded Image';
                    img.style.width = '150px';
                    img.style.height = 'auto';
                    li.appendChild(img);
                    gallery.appendChild(li);
                });
            }
        })
        .catch(error => console.error('Error fetching images:', error));
}

// Load images on page load
if (uploadForm) {
    fetchImages();
}
