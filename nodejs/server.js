require('dotenv').config();
console.log("DATABASE_URL from .env:", process.env.DATABASE_URL);
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(express.json());

// Get all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user by ID
app.get('/user/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `User not found with id ${id}` });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Add a new user
app.post('/users', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await pool.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name]);
        res.json({ message: 'User added successfully', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Update user by ID
app.put('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const result = await pool.query('UPDATE users SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `User not found with id ${id}` });
        }
        res.json({ message: `User with ID ${id} updated successfully`, user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete user by ID
app.delete('/users/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `User not found with id ${id}` });
        }
        res.json({ message: `User with ID ${id} deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
