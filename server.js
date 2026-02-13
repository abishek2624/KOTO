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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});