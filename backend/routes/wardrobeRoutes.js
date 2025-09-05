import express from 'express';
import { 
  shareWardrobe, 
  getSharedWardrobes, 
  getSharedWardrobe, 
  unshareWardrobe 
} from '../controllers/wardrobeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Share wardrobe with a friend
router.post('/share', shareWardrobe);

// Get all wardrobes shared with current user
router.get('/shared', getSharedWardrobes);

// Get specific shared wardrobe by owner ID
router.get('/shared/:ownerId', getSharedWardrobe);

// Remove sharing with a friend
router.delete('/unshare/:friendId', unshareWardrobe);

export default router;
