import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getOutfitRecommendation, getRecommendationHistory } from '../controllers/recommendationController.js';

const router = express.Router();

// Get outfit recommendation
router.post('/outfit', authenticateToken, getOutfitRecommendation);

// Get recommendation history and stats
router.get('/history', authenticateToken, getRecommendationHistory);

export default router;
