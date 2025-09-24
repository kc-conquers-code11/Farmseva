const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { crop, soilType='', ph, tempC, rainfallMm } = req.body;
  const suggestions = [];
  if (ph && ph < 5.5) suggestions.push('Soil is acidic: apply lime to increase pH.');
  if (ph && ph > 7.5) suggestions.push('Soil is alkaline: consider gypsum or organic matter.');
  if (crop && crop.toLowerCase()==='rice') {
    if (rainfallMm !== undefined && rainfallMm < 50) suggestions.push('Rice requires standing water — ensure irrigation.');
  }
  if (crop && crop.toLowerCase()==='wheat') {
    if (tempC !== undefined && tempC > 30) suggestions.push('High temperature during heading can reduce yield — consider irrigation.');
  }
  if (suggestions.length===0) suggestions.push('No urgent issues detected — follow standard best practices.');
  res.json({crop, suggestions});
});

module.exports = router;
