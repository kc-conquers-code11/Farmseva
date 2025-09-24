const express = require('express');
const router = express.Router(); // This line was missing
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
// Provide a default structure
const db = new Low(adapter, { users: [] });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  await db.read();
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({error:'email & password required'});
  const exists = (db.data.users || []).find(u => u.email === email);
  if (exists) return res.status(400).json({error:'User exists'});
  const user = { id: nanoid(), name: name || email.split('@')[0], email, password };
  db.data.users.push(user);
  await db.write();
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
  res.json({user:{id:user.id,name:user.name,email:user.email}, token});
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body;
  const user = (db.data.users || []).find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({error:'Invalid creds'});
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
  res.json({user:{id:user.id,name:user.name,email:user.email}, token});
});

module.exports = router;
