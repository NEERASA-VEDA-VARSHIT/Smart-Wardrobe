import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getMySuggestions,
  getMyCreatedSuggestions,
  createSuggestion,
  acceptSuggestion,
  rejectSuggestion,
  getWardrobeForStyling,
  getSuggestionStats
} from '../controllers/outfitSuggestionController.js';

const router = express.Router();

// Get suggestions I received (as wardrobe owner)
router.get('/my-suggestions', authenticateToken, getMySuggestions);

// Get suggestions I created (as stylist)
router.get('/my-created', authenticateToken, getMyCreatedSuggestions);

// Create a new outfit suggestion
router.post('/create', authenticateToken, createSuggestion);

// Accept a suggestion
router.patch('/:id/accept', authenticateToken, acceptSuggestion);

// Reject a suggestion
router.patch('/:id/reject', authenticateToken, rejectSuggestion);

// Get wardrobe items for styling (for stylists)
router.get('/wardrobe/:ownerId', authenticateToken, getWardrobeForStyling);

// Get suggestion statistics
router.get('/stats', authenticateToken, getSuggestionStats);

export default router;
