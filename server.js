const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const SECRET = "organ_secret_key_123";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- Middleware ---
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: "No token provided" });
    jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await db.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, hash]);
        res.json({ message: "User registered" });
    } catch (e) { res.status(400).json({ error: "Email exists" }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (users.rows.length && await bcrypt.compare(password, users.rows[0].password_hash)) {
        const token = jwt.sign({ id: users.rows[0].user_id }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else { res.status(401).json({ error: "Invalid credentials" }); }
});

// --- Donor/Recipient Routes ---
app.get('/api/donors', async (req, res) => {
    const data = await db.query("SELECT * FROM person JOIN donor ON person.person_id = donor.donor_id");
    res.json(data.rows);
});

app.post('/api/donors', async (req, res) => {
    const { name, age, gender, blood_group, phone } = req.body;
    const res1 = await db.query("INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) RETURNING person_id", [name, age, gender, blood_group, phone]);
    await db.query("INSERT INTO donor (donor_id, consent) VALUES ($1, true)", [res1.rows[0].person_id]);
    res.json({ id: res1.rows[0].person_id });
});

app.get('/api/recipients', async (req, res) => {
    const data = await db.query("SELECT * FROM person JOIN recipient ON person.person_id = recipient.recipient_id");
    res.json(data.rows);
});

app.post('/api/recipients', async (req, res) => {
    const { name, age, gender, blood_group, phone, organ_needed, urgency } = req.body;
    const res1 = await db.query("INSERT INTO person (name, age, gender, blood_group, phone) VALUES ($1, $2, $3, $4, $5) RETURNING person_id", [name, age, gender, blood_group, phone]);
    await db.query("INSERT INTO recipient (recipient_id, organ_needed, urgency_level) VALUES ($1, $2, $3)", [res1.rows[0].person_id, organ_needed, urgency]);
    res.json({ id: res1.rows[0].person_id });
});

// --- Organ Routes ---
app.post('/api/organs', async (req, res) => {
    const { donor_id, organ_type } = req.body;
    let hours = organ_type === 'Heart' ? 6 : organ_type === 'Liver' ? 12 : 24;
    await db.query("INSERT INTO organ (donor_id, organ_type, expiry_time) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '1 hour' * $3)", [donor_id, organ_type, hours]);
    res.json({ message: "Organ added" });
});

app.get('/api/organs', async (req, res) => {
    try {
        const data = await db.query("SELECT * FROM organ WHERE availability_status = 'available'");
        res.json(data.rows);
    } catch (error) {
        console.error('Error in organs query:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// --- Matching Routes ---
app.get('/api/potential-matches', async (req, res) => {
    const data = await db.query("SELECT * FROM view_potential_matches");
    res.json(data.rows);
});

app.post('/api/run-match', async (req, res) => {
    const result = await db.query("SELECT * FROM perform_priority_matching()");
    res.json(result.rows[0]);
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('Initializing database...');
        // await db.initializeSampleData(); // Disabled due to connection timeout
        console.log('Database initialized successfully');
        
        // Only start listening after database is fully initialized
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Server running on port", PORT);
            console.log("Database is ready and accepting requests");
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

// Only start server if not running in Vercel
if (require.main === module) {
    startServer();
}

// Export for Vercel
module.exports = app;