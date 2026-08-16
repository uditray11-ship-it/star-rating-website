const express = require('express');
const db = require('../config/db');
const { authenticate, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, allowRoles('OWNER'));

router.get('/dashboard', async (req, res) => {
  try {
    const [stores] = await db.execute('SELECT id,name,email,address FROM stores WHERE owner_id=?', [req.user.id]);
    if (!stores.length) return res.json({ store: null, averageRating: 0, ratings: [] });
    const store = stores[0];
    const [[average]] = await db.execute('SELECT COALESCE(ROUND(AVG(rating),2),0) AS average FROM ratings WHERE store_id=?', [store.id]);
    const [ratings] = await db.execute('SELECT u.name,u.email,r.rating FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=? ORDER BY u.name ASC', [store.id]);
    res.json({ store, averageRating: average.average, ratings });
  } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
