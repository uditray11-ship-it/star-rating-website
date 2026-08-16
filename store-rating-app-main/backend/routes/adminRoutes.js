const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { authenticate, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, allowRoles('ADMIN'));

function validName(name) { return typeof name === 'string' && name.trim().length >= 20 && name.trim().length <= 60; }
function validPassword(p) { return typeof p === 'string' && /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(p); }
function validEmail(e) { return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

router.get('/dashboard', async (req, res) => {
  try {
    const [[users]] = await db.query("SELECT COUNT(*) AS total FROM users");
    const [[stores]] = await db.query("SELECT COUNT(*) AS total FROM stores");
    const [[ratings]] = await db.query("SELECT COUNT(*) AS total FROM ratings");
    res.json({ users: users.total, stores: stores.total, ratings: ratings.total });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    if (!validName(name)) return res.status(400).json({ message: 'Name must be 20 to 60 characters' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (!address || address.length > 400) return res.status(400).json({ message: 'Address is required and max 400 characters' });
    if (!validPassword(password)) return res.status(400).json({ message: 'Password must be 8-16 characters with uppercase and special character' });
    if (!['USER', 'ADMIN', 'OWNER'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) return res.status(409).json({ message: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)', [name.trim(), email.toLowerCase(), hash, address.trim(), role]);
    res.status(201).json({ message: 'User created' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.get('/users', async (req, res) => {
  try {
    const { name = '', email = '', address = '', role = '', sortBy = 'name', order = 'asc' } = req.query;
    const allowedSort = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
    const sortColumn = allowedSort[sortBy] || 'u.name';
    const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    let sql = 'SELECT id,name,email,address,role FROM users WHERE 1=1';
    const params = [];
    if (name) { sql += ' AND name LIKE ?'; params.push(`%${name}%`); }
    if (email) { sql += ' AND email LIKE ?'; params.push(`%${email}%`); }
    if (address) { sql += ' AND address LIKE ?'; params.push(`%${address}%`); }
    if (role) { sql += ' AND role = ?'; params.push(role); }
    sql += ` ORDER BY ${sortColumn} ${direction}`;
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT u.id,u.name,u.email,u.address,u.role, CASE WHEN u.role='OWNER' THEN COALESCE(AVG(r.rating),0) ELSE NULL END AS rating FROM users u LEFT JOIN stores s ON s.owner_id=u.id LEFT JOIN ratings r ON r.store_id=s.id WHERE u.id=? GROUP BY u.id`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Store name is required' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email' });
    if (!address || address.length > 400) return res.status(400).json({ message: 'Address is required and max 400 characters' });
    if (ownerId) {
      const [owner] = await db.execute("SELECT id FROM users WHERE id=? AND role='OWNER'", [ownerId]);
      if (!owner.length) return res.status(400).json({ message: 'Selected owner does not exist' });
    }
    await db.execute('INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)', [name.trim(), email.trim().toLowerCase(), address.trim(), ownerId || null]);
    res.status(201).json({ message: 'Store created' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.get('/stores', async (req, res) => {
  try {
    const { name = '', email = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
    const allowedSort = { name: 's.name', email: 's.email', address: 's.address', rating: 'average_rating' };
    const sortColumn = allowedSort[sortBy] || 's.name';
    const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    let sql = `SELECT s.id,s.name,s.email,s.address,s.owner_id,COALESCE(ROUND(AVG(r.rating),2),0) AS average_rating FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE 1=1`;
    const params = [];
    if (name) { sql += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (email) { sql += ' AND s.email LIKE ?'; params.push(`%${email}%`); }
    if (address) { sql += ' AND s.address LIKE ?'; params.push(`%${address}%`); }
    sql += ` GROUP BY s.id ORDER BY ${sortColumn} ${direction}`;
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
