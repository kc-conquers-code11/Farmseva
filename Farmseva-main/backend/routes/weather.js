const express = require('express');
const router = express.Router();

const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // Use JSONFile for async
const path = require('path');

const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
// Provide a default structure
const db = new Low(adapter, { weatherBackup: {} });

router.get('/', async (req, res) => {
  const q = req.query.q || 'Delhi';
  const key = process.env.OPENWEATHER_API_KEY || '';
  if (!key) {
    await db.read();
    const backup = (db.data.weatherBackup || {})[q.toLowerCase()] || db.data.weatherBackup['delhi'];
    return res.json(backup);
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&appid=${key}`;
    const r = await axios.get(url, { timeout: 5000 });
    res.json(r.data);
  } catch (e) {
    await db.read();
    const backup = (db.data.weatherBackup || {})[q.toLowerCase()] || db.data.weatherBackup['delhi'];
    res.json(backup);
  }
});

module.exports = router;
