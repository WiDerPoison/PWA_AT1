// Add event listener for the study form submission 

document.getElementById('study-form').addEventListener('submit', function(event) { 
    event.preventDefault(); 
    // Get values from the input fields 
    const subject = document.getElementById('subject').value; 
    const topic = document.getElementById('topic').value; 
    const due_date = document.getElementById('due-date').value; 
    // Send a POST request to add a new study session 
    fetch('/api/study-sessions', { 
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json' 
        }, 
        body: JSON.stringify({ subject, topic, due_date }) 
    
    }) 
    .then(response => { 
        if (!response.ok) { 
            throw new Error('Network response was not ok'); 
        } 
        return response.json(); 
    }) 
    .then(data => { 
        console.log('Study session added:', data); 
        fetchStudySessions(); // Refresh the list of study sessions 
    }) 
    .catch(error => console.error('Error:', error)); 
}); 
    
// Add event listener for the search button 
    
document.getElementById('search-button').addEventListener('click', function() { 
    const query = document.getElementById('search-query').value; 
    fetchStudySessions(query); // Fetch study sessions based on the search query 
}); 
    
// Function to fetch study sessions from the server     
function fetchStudySessions(query = '') { 
    const url = query ? `/api/study-sessions/search?query=${encodeURIComponent(query)}` : '/api/study-sessions'; 
    fetch(url) 
        .then(response => { 
            if (!response.ok) { 
                throw new Error('Network response was not ok'); 
            } 
            return response.json(); 
        }) 
        .then(data => 
            { 
            const studyList = document.getElementById('study-list'); 
            studyList.innerHTML = ''; // Clear the existing list 
            // Populate the list with study sessions 
            data.forEach(session => { 
                const li = document.createElement('li'); 
                li.textContent = `${session.subject} - ${session.topic} (Due: ${session.due_date})`; 
                studyList.appendChild(li); 
            }); 
            }) 
            .catch(error => console.error('Error fetching sessions:', error)); 
    
    } 
    
    // Load existing study sessions when the page loads 
    
    fetchStudySessions(); 
    
    // Service Worker registration 
if ('serviceWorker' in navigator) 
{ 
    navigator.serviceWorker.register('service-worker.js') 
        .then(() => 
        { 
            console.log('Service Worker Registered'); 
        }) 
        .catch(error => console.error('Service Worker registration failed:', error)); 
    
} 