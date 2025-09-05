import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { inviteFriend, acceptInvite, listMyShares, revokeShare } from '../controllers/sharesController.js';

const router = Router();

router.post('/invite', authenticateToken, inviteFriend);
router.post('/accept', authenticateToken, acceptInvite);
router.get('/', authenticateToken, listMyShares);
router.post('/:id/revoke', authenticateToken, revokeShare);

export default router;


