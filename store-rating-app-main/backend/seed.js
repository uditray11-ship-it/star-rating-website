require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  try {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const ownerPassword = await bcrypt.hash('Owner@123', 10);

    await db.execute(`INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE email=email`, [
      'System Administrator Account', 'admin@example.com', adminPassword, 'Main Office, Bengaluru', 'ADMIN'
    ]);

    await db.execute(`INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE email=email`, [
      'Sample Store Owner Account', 'owner@example.com', ownerPassword, 'MG Road, Bengaluru', 'OWNER'
    ]);

    const [owners] = await db.execute("SELECT id FROM users WHERE email='owner@example.com'");
    if (owners.length) {
      const [stores] = await db.execute("SELECT id FROM stores WHERE email='store@example.com'");
      if (!stores.length) {
        await db.execute('INSERT INTO stores (name,email,address,owner_id) VALUES (?,?,?,?)', ['Sample Rating Store', 'store@example.com', 'MG Road, Bengaluru', owners[0].id]);
      }
    }

    console.log('Seed completed.');
    console.log('Admin: admin@example.com / Admin@123');
    console.log('Owner: owner@example.com / Owner@123');
  } catch (error) {
    console.error(error);
  } finally {
    await db.end();
  }
}
seed();
