const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60;
}

function validatePassword(password) {
  return typeof password === 'string' && /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(password);
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;
    if (!validateName(name)) return res.status(400).json({ message: 'Name must be 20 to 60 characters' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (typeof address !== 'string' || !address.trim() || address.length > 400) return res.status(400).json({ message: 'Address is required and must be at most 400 characters' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be 8-16 characters with an uppercase letter and special character' });

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)', [name.trim(), email.trim().toLowerCase(), hash, address.trim(), 'USER']);
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || !password) return res.status(400).json({ message: 'Email and password are required' });

    const [rows] = await db.execute('SELECT id,name,email,password,address,role FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be 8-16 characters with an uppercase letter and special character' });
    const hash = await bcrypt.hash(password, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
