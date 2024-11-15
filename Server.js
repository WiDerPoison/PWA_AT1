const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'study-planner.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create the study_sessions table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        due_date TEXT NOT NULL
    )`);
});

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
    const sql = 'SELECT * FROM study_sessions';
    
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

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
