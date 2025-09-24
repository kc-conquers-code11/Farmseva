const express = require('express');
const router = express.Router();

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // Use JSONFile for async
const path = require('path');
//...

const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
// Provide a default structure
const db = new Low(adapter, { listings: [] });

// auth helper
function getUserFromToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(auth.split('Bearer ')[1], process.env.JWT_SECRET || 'secret');
    return decoded;
  } catch (e) { return null; }
}

router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.listings || []);
});

router.post('/', async (req, res) => {
  await db.read();
  const u = getUserFromToken(req);
  if (!u) return res.status(401).json({error:'Unauthorized'});
  const payload = {
    id: nanoid(),
    title: req.body.title || 'Untitled',
    price: req.body.price || 0,
    qty: req.body.qty || 1,
    ownerId: u.id,
    location: req.body.location || '',
    details: req.body.details || '',
    createdAt: Date.now()
  };
  db.data.listings.push(payload);
  await db.write();
  res.json({ok:true, id: payload.id});
});

router.put('/:id', async (req, res) => {
  await db.read();
  const u = getUserFromToken(req);
  if (!u) return res.status(401).json({error:'Unauthorized'});
  const id = req.params.id;
  const idx = (db.data.listings||[]).findIndex(x=>x.id===id);
  if (idx === -1) return res.status(404).json({error:'Not found'});
  if (db.data.listings[idx].ownerId !== u.id) return res.status(403).json({error:'Not owner'});
  db.data.listings[idx] = {...db.data.listings[idx], ...req.body};
  await db.write();
  res.json({ok:true});
});

router.delete('/:id', async (req, res) => {
  await db.read();
  const u = getUserFromToken(req);
  if (!u) return res.status(401).json({error:'Unauthorized'});
  const id = req.params.id;
  const idx = (db.data.listings||[]).findIndex(x=>x.id===id);
  if (idx === -1) return res.status(404).json({error:'Not found'});
  if (db.data.listings[idx].ownerId !== u.id) return res.status(403).json({error:'Not owner'});
  db.data.listings.splice(idx,1);
  await db.write();
  res.json({ok:true});
});

module.exports = router;
