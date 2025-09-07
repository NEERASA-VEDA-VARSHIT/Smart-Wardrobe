import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import clothesRoutes from './routes/clothesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sharesRoutes from './routes/sharesRoutes.js';
import sharedRoutes from './routes/sharedRoutes.js';
import wardrobeRoutes from './routes/wardrobeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import outfitSuggestionRoutes from './routes/outfitSuggestionRoutes.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health route
app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Smart Wardrobe API', env: process.env.NODE_ENV || 'development' });
});

// API routes
app.use('/auth', authRoutes);
app.use('/clothes', clothesRoutes);
app.use('/shares', sharesRoutes);
app.use('/shared', sharedRoutes);
app.use('/wardrobe', wardrobeRoutes);
app.use('/notifications', notificationRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/suggestions', outfitSuggestionRoutes);

// Start server after connecting DB
(async () => {
  try {
    console.log('Attempting to connect to database...');
    await connectDB(process.env.dbUrl);
    console.log('Database connected successfully');
    
    console.log('Starting server...');
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
