import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  listSharedClothes, 
  listOutfits, 
  createOutfit, 
  getMyOutfits, 
  updateOutfitStatus 
} from '../controllers/sharedController.js';

const router = Router();

// Get my outfits (as owner) - must come before parameterized routes
router.get('/my/outfits', authenticateToken, getMyOutfits);

// Access shared data by ownerId
router.get('/:ownerId/clothes', authenticateToken, listSharedClothes);
router.get('/:ownerId/outfits', authenticateToken, listOutfits);
router.post('/:ownerId/outfits', authenticateToken, createOutfit);

// Update outfit status (accept/reject)
router.patch('/outfits/:outfitId', authenticateToken, updateOutfitStatus);

export default router;


