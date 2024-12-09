const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer'); // For file handling

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, 'study-planner.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables if they don't exist
db.serialize(() => {
    // Study sessions table
    db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        due_date TEXT NOT NULL
    )`);

    // Images table
    db.run(`CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'), 
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Endpoint to add a new study session
app.post('/api/study-sessions', (req, res) => {
    const { subject, topic, due_date } = req.body;
    const sql = 'INSERT INTO study_sessions (subject, topic, due_date) VALUES (?, ?, ?)';
    
    db.run(sql, [subject, topic, due_date], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Endpoint to retrieve all study sessions
app.get('/api/study-sessions', (req, res) => {
    const sql = 'SELECT * FROM study_sessions ORDER BY due_date'; // Orders by urgency of tasks
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint to search study sessions by subject or topic
app.get('/api/study-sessions/search', (req, res) => {
    const { query } = req.query;
    const sql = `
        SELECT * FROM study_sessions 
        WHERE subject LIKE ? OR topic LIKE ?`;
    
    db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint to upload an image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;
    db.run(
        'INSERT INTO images (filename) VALUES (?)',
        [filename],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to save image' });
            }
            res.status(201).json({ id: this.lastID, filename });
        }
    );
});

// Endpoint to fetch all images
app.get('/api/images', (req, res) => {
    db.all('SELECT * FROM images ORDER BY upload_date DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch images' });
        }
        res.json(rows);
    });
});

// Middleware to parse JSON data
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'uploads' folder (outside 'public' folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Serve the splash screen HTML file
app.get('/splash', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SplashScreen.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
