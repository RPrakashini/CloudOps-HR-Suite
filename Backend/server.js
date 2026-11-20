
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database configuration using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('Connected to MySQL database successfully');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    application: 'CloudOps HR Suite Backend',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (req, res) => {
  res.json({ message: 'Employee Management API is running' });
});

// Get all employees
app.get('/employees', (req, res) => {
  db.query('SELECT * FROM employees', (err, results) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }
    res.json(results);
  });
});

// Add employee
app.post('/employees', (req, res) => {
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({ error: 'Name and position are required' });
  }

  const sql = 'INSERT INTO employees (name, position) VALUES (?, ?)';

  db.query(sql, [name, position], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to add employee' });
    }

    res.status(201).json({
      id: result.insertId,
      name,
      position
    });
  });
});

// Update employee
app.put('/employees/:id', (req, res) => {
  const { name, position } = req.body;
  const { id } = req.params;

  if (!name || !position) {
    return res.status(400).json({ error: 'Name and position are required' });
  }

  const sql = 'UPDATE employees SET name = ?, position = ? WHERE id = ?';

  db.query(sql, [name, position, id], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to update employee' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ id, name, position });
  });
});

// Delete employee
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to delete employee' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully', id });
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
