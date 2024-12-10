document.addEventListener('DOMContentLoaded', () => {
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

        // Load images on page load
        fetchImages();
    }
});

function fetchImages() {
    fetch('/api/images')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            return response.json();
        })
        .then(data => {
            const gallery = document.getElementById('image-gallery');
            if (gallery) {
                gallery.innerHTML = ''; // Clear existing images
                data.forEach(image => {
                    const filePath = `/uploads/${image.filename}`;
                    fetch(filePath, { method: 'HEAD' })
                        .then(fileResponse => {
                            if (fileResponse.ok) {
                                // Add image to gallery
                                const li = document.createElement('li');
                                const img = document.createElement('img');
                                img.src = filePath;
                                img.alt = 'Uploaded Image';
                                img.style.width = '150px';
                                img.style.height = 'auto';
                                li.appendChild(img);
                                gallery.appendChild(li);
                            } else {
                                // File not found, delete from DB
                                deleteImageFromDB(image.id);
                            }
                        })
                        .catch(err => console.error(`Error verifying file: ${filePath}`, err));
                });
            }
        })
        .catch(error => console.error('Error fetching images:', error));
}

function deleteImageFromDB(imageId) {
    fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete image from database');
            }
            console.log(`Deleted missing image with ID: ${imageId}`);
        })
        .catch(error => console.error('Error deleting image from database:', error));
}

