const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const advisoryRoutes = require('./routes/advisory');
const weatherRoutes = require('./routes/weather');
const schemesRoutes = require('./routes/schemes');
const seed = require('./utils/seed');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/schemes', schemesRoutes);

app.post('/api/seed', async (req, res) => {
    try {
        await seed();
        res.json({ok:true});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend running on', PORT));
