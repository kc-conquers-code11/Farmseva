const { Low } = require('lowdb');
const FileSync = require('lowdb/node');
const { nanoid } = require('nanoid');
const path = require('path');

module.exports = async function seed() {
  const file = path.join(__dirname, '..', 'db.json');
  const adapter = new FileSync.default(file);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || { users: [], listings: [], attendance: [], schemes: [], weatherBackup: {} };

  if (db.data.users.length === 0) {
    db.data.users.push({ id: nanoid(), name: 'Farmer One', email: 'farmer1@demo.com', password: 'password' });
    db.data.users.push({ id: nanoid(), name: 'Buyer One', email: 'buyer1@demo.com', password: 'password' });
  }

  if (db.data.listings.length === 0) {
    db.data.listings.push({ id: nanoid(), title: 'Basmati Rice - 20kg', price: 2500, qty: 5, ownerId: db.data.users[0].id, location: 'Village A', details: 'Premium basmati', createdAt: Date.now() });
    db.data.listings.push({ id: nanoid(), title: 'Tomato - crate', price: 200, qty: 30, ownerId: db.data.users[0].id, location: 'Village B', details: 'Fresh harvest', createdAt: Date.now() });
  }

  await db.write();
};
