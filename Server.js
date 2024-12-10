const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

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

// Function to clean up duplicate images based on their content (SHA256 hash)
function cleanUpDuplicates() {
    const findDuplicatesSQL = `SELECT id, filename FROM images`;
    db.all(findDuplicatesSQL, [], (err, rows) => {
        if (err) {
            console.error('Error fetching images for duplicate cleanup:', err.message);
            return;
        }

        const fileHashes = {};

        rows.forEach((image) => {
            const imagePath = path.join(__dirname, 'uploads', image.filename);
            if (fs.existsSync(imagePath)) {
                // Generate hash for the image content
                const fileBuffer = fs.readFileSync(imagePath);
                const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

                // Check if hash already exists (indicating duplicate)
                if (fileHashes[hash]) {
                    // Mark duplicate for deletion
                    const duplicateID = image.id;
                    db.run('DELETE FROM images WHERE id = ?', [duplicateID], function (err) {
                        if (err) {
                            console.error(`Error deleting duplicate image with ID ${duplicateID}:`, err.message);
                        } else {
                            console.log(`Deleted duplicate image with ID ${duplicateID}`);
                            fs.unlinkSync(imagePath);  // Also delete the file
                        }
                    });
                } else {
                    // Store the hash for future comparisons
                    fileHashes[hash] = image.id;
                }
            }
        });
    });
}

// Function to cache images from the uploads folder into the database on server startup
function cacheImages() {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads folder:', err.message);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(uploadDir, file);

            // Check if the file is already in the database
            const checkFileSQL = 'SELECT id FROM images WHERE filename = ?';
            db.get(checkFileSQL, [file], (err, row) => {
                if (err) {
                    console.error('Error checking if file exists in the database:', err.message);
                    return;
                }

                // If the file is not in the database, add it
                if (!row) {
                    const insertSQL = 'INSERT INTO images (filename) VALUES (?)';
                    db.run(insertSQL, [file], function (err) {
                        if (err) {
                            console.error('Error inserting image into database:', err.message);
                            return;
                        }
                        console.log(`Inserted image ${file} into the database.`);
                    });
                }
            });
        });
    });
}

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

    // Run duplicate cleanup
    cleanUpDuplicates();

    // Cache images from uploads folder into the database on server startup
    cacheImages();
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
    const sql = 'SELECT * FROM study_sessions ORDER BY due_date';
    
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

// Endpoint to delete an image
app.delete('/api/images/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM images WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(`Error deleting image with ID ${id}:`, err.message);
            return res.status(500).json({ error: `Failed to delete image with ID ${id}` });
        }
        res.status(200).json({ success: true });
    });
});

// Optional endpoint to trigger duplicate cleanup manually
app.post('/api/clean-duplicates', (req, res) => {
    cleanUpDuplicates();
    res.status(200).send('Duplicate cleanup completed.');
});

// Middleware to parse JSON data
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the splash screen HTML file
app.get('/splash', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'SplashScreen.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
