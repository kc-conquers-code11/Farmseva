const express = require('express');
const router = express.Router();

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // Use JSONFile for async
const path = require('path');

const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
// Provide a default structure
const db = new Low(adapter, { schemes: [] });

router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.schemes || []);
});

module.exports = router;
