import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createOrUpdateCollection,
  listMyCollections,
  getCollection,
  deleteCollection,
  inviteToCollection,
  getSharedCollectionByToken,
  listInvitedCollections
} from '../controllers/collectionController.js';

const router = express.Router();

router.get('/', authenticateToken, listMyCollections);
router.post('/', authenticateToken, createOrUpdateCollection);
router.get('/:id', authenticateToken, getCollection);
router.delete('/:id', authenticateToken, deleteCollection);
router.post('/:id/invite', authenticateToken, inviteToCollection);
router.get('/shared/token/:token', getSharedCollectionByToken);
router.get('/invited/mine', authenticateToken, listInvitedCollections);

export default router;


