const express = require('express');
const db = require('../config/db');
const { authenticate, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, allowRoles('USER'));

router.get('/stores', async (req, res) => {
  try {
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'name';
    const direction = String(req.query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const allowed = { name: 's.name', address: 's.address', rating: 'average_rating' };
    const sortColumn = allowed[sortBy] || 's.name';
    const sql = `SELECT s.id,s.name,s.address,COALESCE(ROUND(AVG(allr.rating),2),0) AS average_rating,ur.rating AS my_rating FROM stores s LEFT JOIN ratings allr ON allr.store_id=s.id LEFT JOIN ratings ur ON ur.store_id=s.id AND ur.user_id=? WHERE s.name LIKE ? OR s.address LIKE ? GROUP BY s.id,ur.rating ORDER BY ${sortColumn} ${direction}`;
    const [rows] = await db.execute(sql, [req.user.id, `%${search}%`, `%${search}%`]);
    res.json(rows);
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.post('/rating', async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const value = Number(rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    const [store] = await db.execute('SELECT id FROM stores WHERE id=?', [storeId]);
    if (!store.length) return res.status(404).json({ message: 'Store not found' });
    const [existing] = await db.execute('SELECT id FROM ratings WHERE user_id=? AND store_id=?', [req.user.id, storeId]);
    if (existing.length) return res.status(409).json({ message: 'You already rated this store. Use modify.' });
    await db.execute('INSERT INTO ratings (user_id,store_id,rating) VALUES (?,?,?)', [req.user.id, storeId, value]);
    res.status(201).json({ message: 'Rating submitted' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

router.put('/rating/:storeId', async (req, res) => {
  try {
    const value = Number(req.body.rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
    const [result] = await db.execute('UPDATE ratings SET rating=? WHERE user_id=? AND store_id=?', [value, req.user.id, req.params.storeId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Rating not found' });
    res.json({ message: 'Rating updated' });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
