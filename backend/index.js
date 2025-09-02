import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import clothesRoutes from './routes/clothesRoutes.js';
import itemsRoutes from './routes/itemsRoutes.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health route
app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Smart Wardrobe API', env: process.env.NODE_ENV || 'development' });
});

// API routes
app.use('/clothes', clothesRoutes);
app.use('/items', itemsRoutes);

// Start server after connecting DB
(async () => {
  await connectDB(process.env.dbUrl);
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
})();
