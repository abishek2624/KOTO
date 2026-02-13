const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // default XAMPP
  password: '', // default
  database: 'koto'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Get phrases ordered by usage desc
app.get('/api/phrases', (req, res) => {
  db.query('SELECT * FROM phrases ORDER BY usage_count DESC', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Update usage
app.put('/api/phrases/:id', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE phrases SET usage_count = usage_count + 1 WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.sendStatus(200);
    }
  });
});

// Sign Up endpoint
app.post('/api/signup', (req, res) => {
  const { username, password, disability_type, caregiver_name, caregiver_relation, caregiver_phone1, caregiver_phone2, caregiver_email } = req.body;

  // Validate required fields
  if (!username || !password || !disability_type || !caregiver_name || !caregiver_relation || !caregiver_phone1 || !caregiver_email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Check if user already exists
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Insert new user
    db.query(
      'INSERT INTO users (username, password, disability_type, caregiver_name, caregiver_relation, caregiver_phone1, caregiver_phone2, caregiver_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, password, disability_type, caregiver_name, caregiver_relation, caregiver_phone1, caregiver_phone2 || '', caregiver_email],
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error creating account' });
        }
        res.status(201).json({ message: 'Account created successfully', disability_type });
      }
    );
  });
});

// Sign In endpoint
app.post('/api/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    // Update last login
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        disability_type: user.disability_type,
        caregiver_name: user.caregiver_name
      }
    });
  });
});

// Get user profile
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT id, username, disability_type, caregiver_name, caregiver_relation, caregiver_phone1, caregiver_phone2, caregiver_email FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});