import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications for current user
router.get('/', getNotifications);

// Get unread count only
router.get('/unread-count', getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

export default router;
